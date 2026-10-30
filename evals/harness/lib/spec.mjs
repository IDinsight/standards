// Structural checks on a fixture spec (part of gate 1), before anything is
// built: fields, layer actions, the check vocabulary, one entry per assertion,
// the N/A assertions listed below, the standard role invariants, the
// runtime block, and history. A generated spec that fails here goes back to the
// generator in its one repair call.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { predicateOf } from '../grade.mjs';
import { EVALS_ROOT, FIXTURES_ROOT } from './cases.mjs';
import { runtimeProblems } from './runtime.mjs';

// Assertions that describe counterfactual, future, or optional behavior, which
// no single run can show. They are N/A: kept out of pass rates.
export const NA_ASSERTIONS = new Set(['architect-9.2', 'auditor-6.6', 'developer-8.3', 'developer-9.7', 'developer-14.5', 'developer-15.3',
  'developer-16.2', 'developer-16.4', 'navigator-65.1', 'reviewer-16.1', 'reviewer-24.3', 'tester-9.2', 'developer-57.4']);

export const STATUSES = ['draft', 'gated', 'flagged', 'reviewed', 'rejected'];
const LAYER_ACTIONS = new Set(['commit', 'stage', 'unstaged', 'untracked', 'delete', 'branch', 'checkout', 'git-config']);
const NEEDS_DIR = new Set(['commit', 'stage', 'unstaged', 'untracked']);

// Invariants every role run is held to unless the spec exempts one with a
// reason (for example a case where the user explicitly asks for a commit).
// Optional list fields may be absent or null; both mean "none".
const list = (x) => (Array.isArray(x) ? x : []);

export function standardInvariantProblems(role, invariants, exemptions) {
  const exempt = new Set(list(exemptions).map((e) => e?.invariant));
  const has = (pred, test = () => true) => list(invariants).some((i) => i && pred in i && test(i[pred]));
  const p = [];
  if (!exempt.has('head_unchanged') && !has('head_unchanged')) p.push('invariants: missing head_unchanged');
  if (!exempt.has('not_ran_git') && !has('not_ran_git', (v) => v === 'mutating')) p.push('invariants: missing not_ran_git "mutating"');
  if (role !== 'navigator' && !exempt.has('check_ok') && !has('check_ok')) p.push('invariants: missing check_ok');
  if (role === 'navigator' && !exempt.has('unchanged') && !has('unchanged', (v) => [].concat(v).includes('**'))) p.push('invariants: Navigator needs unchanged ["**"]');
  if (['reviewer', 'tester'].includes(role) && !exempt.has('unchanged') && !has('unchanged')) p.push(`invariants: ${role} needs an unchanged invariant on implementation paths`);
  return p;
}

// Only the owner marks N/A: the list above (LISTED_NA), or `decide.mjs na`
// (OWNER_NA). Each writes its reason prefix.
export const OWNER_NA = 'owner decision:';
export const LISTED_NA = 'listed N/A:';

// Assertions the catalog routes to the judge: tagged "trace" (what the role
// read or ran, which no check decides) or "judge", or not deterministic_complete.
// `complete: true` would let code alone decide them.
export function judgeRoutedAssertions(kase) {
  try {
    const cat = JSON.parse(readFileSync(path.join(EVALS_ROOT, 'catalog', `${kase.role}.json`), 'utf8')).cases.find((c) => c.id === kase.id);
    return new Set((cat?.assertions ?? []).filter((a) => !a.deterministic_complete || (a.graders ?? []).some((g) => g === 'trace' || g === 'judge')).map((a) => a.i));
  } catch { return new Set(); }
}

// ${VAR} names used in checks, invariants, or runtime that no var defines
// (an unresolved one would fail, or vacuously pass, every run).
export function undefinedVars(spec, vars = {}) {
  const used = [...JSON.stringify([spec.checks ?? null, spec.invariants ?? null, spec.runtime ?? null]).matchAll(/\$\{(\w+)\}/g)].map((m) => m[1]);
  return [...new Set(used)].filter((v) => !(v in (vars ?? {})));
}

export function specProblems(spec, { kase = null, specDir = null, isBase = false } = {}) {
  const p = [];
  if (!isBase) {
    if (!kase) return ['no case'];
    if (spec.case !== kase.key) p.push(`case is ${spec.case}, expected ${kase.key}`);
    if (!STATUSES.includes(spec.status)) p.push(`status ${spec.status} is not one of ${STATUSES.join(', ')}`);
    if (spec.prompt?.skill !== kase.role) p.push(`prompt.skill must be ${kase.role}`);
    const u = spec.prompt?.utterance;
    if (typeof u !== 'string' || !u.trim()) p.push('prompt.utterance is empty');
    else if (/^\s*[/$]\w/.test(u)) p.push('prompt.utterance must not include the skill invocation');
    if (!Array.isArray(spec.graderOnly)) p.push('graderOnly must be an array');
  }
  if (spec.base && !existsSync(path.join(FIXTURES_ROOT, '_bases', spec.base, 'spec.json'))) p.push(`unknown base ${spec.base}`);
  if (!Array.isArray(spec.layers)) p.push('layers must be an array');
  for (const [n, l] of list(spec.layers).entries()) {
    if (!LAYER_ACTIONS.has(l.action)) p.push(`layer ${n}: unknown action ${l.action}`);
    if (NEEDS_DIR.has(l.action) && !l.dir) p.push(`layer ${n}: ${l.action} needs a dir`);
    // A layer dir is one directory under layers/, never the spec dir itself
    // (which holds gen/ with the case's assertions) or anything above it.
    if (l.dir !== undefined && !/^layers\/(?!\.{1,2}$)[\w.-]+$/.test(l.dir)) p.push(`layer ${n}: dir must be layers/<name>, got ${JSON.stringify(l.dir)}`);
    if (l.dir && specDir && !existsSync(path.join(specDir, l.dir))) p.push(`layer ${n}: dir ${l.dir} has no files`);
    if (l.phase && l.phase !== 'pre-install') p.push(`layer ${n}: phase must be absent or pre-install`);
    if (l.phase === 'pre-install' && spec.base) p.push(`layer ${n}: a case on a base cannot add pre-install layers`);
    if (l.action === 'delete' && !Array.isArray(l.paths)) p.push(`layer ${n}: delete needs paths`);
    if (['branch', 'checkout'].includes(l.action) && !l.name) p.push(`layer ${n}: ${l.action} needs a name`);
    if (l.action === 'git-config' && (typeof l.config !== 'object' || !Object.keys(l.config ?? {}).length)) p.push(`layer ${n}: git-config needs config`);
    if (l.action === 'commit' && !l.message) p.push(`layer ${n}: commit needs a message`);
  }
  const ec = spec.expectCheck;
  if (!ec || typeof ec.ok !== 'boolean') p.push('expectCheck.ok must be true or false');
  else if (ec.ok === false && !(ec.problemsMatch ?? []).length) p.push('expectCheck.ok false needs problemsMatch');
  for (const re of ec?.problemsMatch ?? []) { try { new RegExp(re); } catch { p.push(`expectCheck.problemsMatch: bad regex ${re}`); } }
  p.push(...runtimeProblems(spec.runtime ?? {}, specDir));
  for (const k of ['layers', 'selfChecks', 'checks', 'invariants', 'invariantExemptions', 'graderOnly']) {
    if (spec[k] !== undefined && spec[k] !== null && !Array.isArray(spec[k])) p.push(`${k} must be an array`);
  }
  for (const c of list(spec.selfChecks)) {
    if (!c.cmd || !['pass', 'fail'].includes(c.expect)) p.push(`selfChecks: needs cmd and expect pass|fail: ${JSON.stringify(c)}`);
    // An expected failure must name how it fails, or any failure (a typo, a missing script) would count.
    else if (c.expect === 'fail' && !c.expectOutput) p.push(`selfChecks: expect "fail" needs expectOutput (a regex the failure output must match): ${c.cmd}`);
    for (const re of [c.expectOutput].filter(Boolean)) { try { new RegExp(re); } catch { p.push(`selfChecks: bad expectOutput regex ${re}`); } }
  }
  if (isBase) return p;

  // One check entry per assertion, in the check vocabulary.
  const checks = list(spec.checks);
  const judgeRouted = judgeRoutedAssertions(kase);
  const byI = new Map();
  for (const ch of checks) {
    if (!Number.isInteger(ch.assertion)) { p.push(`checks: entry without an integer assertion: ${JSON.stringify(ch).slice(0, 80)}`); continue; }
    if (byI.has(ch.assertion)) p.push(`checks: assertion ${ch.assertion} listed twice`);
    byI.set(ch.assertion, ch);
  }
  kase.assertions.forEach((_, i) => {
    const ch = byI.get(i);
    const naKey = `${kase.key}.${i}`;
    if (!ch) { p.push(`checks: assertion ${i} has no entry`); return; }
    if (NA_ASSERTIONS.has(naKey) && ch.na !== true) p.push(`checks: assertion ${i} must be "na": true (listed N/A)`);
    if (ch.na) {
      if (!NA_ASSERTIONS.has(naKey) && !String(ch.na_reason ?? '').startsWith(OWNER_NA)) p.push(`checks: assertion ${i} is marked N/A, but only the listed N/A assertions and the owner's decisions are N/A`);
      return;
    }
    if (typeof ch.complete !== 'boolean') p.push(`checks: assertion ${i} needs complete true or false`);
    if (!Array.isArray(ch.all)) p.push(`checks: assertion ${i} needs an all array`);
    if (ch.complete && !(ch.all ?? []).length) p.push(`checks: assertion ${i} is complete with no checks`);
    if (ch.complete && judgeRouted.has(i)) p.push(`checks: assertion ${i} is judge-graded (it depends on what the role read or ran, or needs judgment); set complete false and keep the checks as preconditions`);
    for (const pred of ch.all ?? []) {
      if (!predicateOf(pred)) p.push(`checks: assertion ${i}: each check needs exactly one known predicate, got ${JSON.stringify(pred).slice(0, 100)}`);
    }
  });
  for (const i of byI.keys()) if (i < 0 || i >= kase.assertions.length) p.push(`checks: assertion ${i} does not exist (case has ${kase.assertions.length})`);
  for (const inv of list(spec.invariants)) {
    if (!predicateOf(inv)) p.push(`invariants: each needs exactly one known predicate: ${JSON.stringify(inv).slice(0, 100)}`);
  }
  p.push(...standardInvariantProblems(kase.role, spec.invariants, spec.invariantExemptions));
  // History: alternating turns, user first, assistant last.
  if (spec.history) {
    const t = spec.history.turns;
    if (!Array.isArray(t) || !t.length) p.push('history.turns must be a non-empty array');
    else {
      if (t[0].role !== 'user' || t.at(-1).role !== 'assistant') p.push('history must start with user and end with assistant');
      t.forEach((x, i) => { if (!['user', 'assistant'].includes(x.role) || typeof x.text !== 'string') p.push(`history.turns[${i}] needs role and text`); if (i && x.role === t[i - 1].role) p.push(`history.turns[${i}] repeats role ${x.role}`); });
    }
  }
  return p;
}

export const readSpec = (dir) => JSON.parse(readFileSync(path.join(dir, 'spec.json'), 'utf8'));
