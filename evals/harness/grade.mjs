#!/usr/bin/env node
// Grade one run against its fixture spec. Deterministic checks run locally; an
// assertion that needs judgment gets a judge request (judge.mjs sends it, only
// after sign-off).
//
//   node grade.mjs <run-dir> <spec-dir> [--judge off|dry]
//
// <run-dir> must contain before.json and after.json (snapshots), transcript.jsonl,
// run.json, and after/ (a copy of the project after the run). Writes
// verdicts.json and, with --judge dry, judge-requests/<n>.json.
//
// Only exact checks exist: workflow state, files, check.mjs, HEAD, git
// subcommands in command position, skill calls, and patterns in what the agent
// wrote. Nothing guesses what a role "read"; the judge sees every tool call.
//
// Verdict rules for each assertion:
//   - a spec entry with "na": true is NA (counterfactual or future behavior no
//     single run can show); it is kept out of pass rates and case status;
//   - every check in `all` is a necessary condition: any FAIL makes the
//     assertion FAIL, with that check's evidence;
//   - if all pass and the spec marks the assertion `complete`, it PASSES;
//   - otherwise the judge decides, and receives the check results;
//   - a grader problem is ERROR, reported separately and never counted as a
//     model failure.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveSpec } from './build-fixture.mjs';
import { findCase } from './lib/cases.mjs';
import { diffManifests } from './lib/snapshot.mjs';
import { pristineRuntime } from './lib/framework.mjs';
import { gitInvocations, gitSubcommands, isMutatingGit, parseTranscript } from './lib/trace.mjs';

const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));

// Explicit forbidden lists (specs may instead write "mutating", which uses
// isMutatingGit in lib/trace.mjs). Entry forms: "commit" matches `commit` and
// `commit <word>`; "=stash" matches only a bare `git stash`; "branch *"
// matches `branch <word>` but not a bare `git branch`.
function gitMatches(sub, entry) {
  if (entry.startsWith('=')) return sub === entry.slice(1);
  if (entry.endsWith(' *')) return sub.startsWith(entry.slice(0, -1));
  return sub === entry || sub.startsWith(`${entry} `);
}

// "app/**" -> /^app\/.*$/, "*.md" -> /^[^/]*\.md$/, and "**/" is zero or more
// directories: "test/**/*.ts" matches test/a.ts and test/x/a.ts, "**/*.md" README.md.
// \u0000 and \u0001 are placeholders no glob contains, swapped in and out.
// eslint-disable-next-line no-control-regex
export const globRe = (g) => new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*\//g, '\u0001').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0001/g, '(?:.*/)?').replace(/\u0000/g, '.*')}$`);

// ${COMMIT:<subject>} in a check: the full hash of that commit in the run's build.
export function substituteRevisions(value, commits = {}) {
  if (typeof value === 'string') return value.replace(/\$\{COMMIT:([^}]+)\}/g, (m, s) => commits[s] ?? m);
  if (Array.isArray(value)) return value.map((v) => substituteRevisions(v, commits));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, substituteRevisions(v, commits)]));
  return value;
}

function substitute(value, vars) {
  if (typeof value === 'string') return value.replace(/\$\{(\w+)\}/g, (_, k) => vars[k] ?? `\${${k}}`);
  if (Array.isArray(value)) return value.map((v) => substitute(v, vars));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, substitute(v, vars)]));
  return value;
}

// Build the evaluation context once per run.
// Files the harness itself replaced during the run (runtime.midRunEdits, logged
// by the in-container hook): the role's starting point for those files is the
// replacement, so they are compared against it, never blamed on the role.
export function midRunBaseline(runDir, specDir) {
  const log = path.join(runDir, 'session', 'eval-midrun.json');
  if (!existsSync(log) || !specDir) return {};
  const edits = resolveSpec(specDir).runtime?.midRunEdits ?? [];
  const out = {};
  for (const applied of readJson(log)) {
    for (const [target, src] of Object.entries(edits[applied.edit]?.files ?? {})) {
      out[target] = createHash('sha256').update(readFileSync(path.join(specDir, src))).digest('hex').slice(0, 16);
    }
  }
  return out;
}

async function context(runDir, specDir) {
  const before = readJson(path.join(runDir, 'before.json'));
  before.files = { ...before.files, ...midRunBaseline(runDir, specDir) };
  const after = readJson(path.join(runDir, 'after.json'));
  const trace = parseTranscript(path.join(runDir, 'transcript.jsonl'), readJson(path.join(runDir, 'run.json')).projectRoot ?? '/work');
  const afterDir = path.join(runDir, 'after');
  // Record parsers from the pinned framework's pristine runtime, never the
  // project's own copy (a role may have edited it, and grading runs on the host).
  const fx = path.join(runDir, 'fixture.json');
  const commit = existsSync(fx) ? readJson(fx).framework ?? undefined : undefined;
  const records = existsSync(path.join(afterDir, '.standards/bin')) ? await import(pathToFileURL(path.join(pristineRuntime(commit), 'lib/records.mjs'))) : null;
  const read = (p) => { const f = path.join(afterDir, p); return existsSync(f) ? readFileSync(f, 'utf8') : null; };
  return { before, after, trace, read, records, diff: diffManifests(before.files, after.files) };
}

const TURN_END_BROKEN = 'turn-end check did not run';

const EMPTY_TRACE = { events: [], texts: [], hooks: [], reply: '', replyAll: '', usage: null };

// A file as it was before the run: unchanged files are read from after/,
// added ones did not exist, and changed or removed ones come from
// before.tar.gz (a check that needs one without the tarball is a grader error).
function readBefore(runDir, c) {
  const tarball = path.join(runDir, 'before.tar.gz');
  return (p) => {
    if (c.diff.added.includes(p)) return null;
    if (c.diff.changed.includes(p) || c.diff.removed.includes(p)) {
      if (!existsSync(tarball)) throw new Error(`earlier content of ${p} not available`);
      try { return execFileSync('tar', ['-xOzf', tarball, `./${p}`], { encoding: 'utf8', maxBuffer: 1 << 26 }); } catch { throw new Error(`earlier content of ${p} not available`); }
    }
    return c.read(p);
  };
}

// Each predicate returns { pass, evidence } or throws (a grader problem).
// `p` is the whole check object for predicates that take options.
const PREDICATES = {
  // { state: <field>, equals | not | in | changed | unchanged }
  state(c, _field, p) {
    const now = c.after.state?.[p.state];
    const was = c.before.state?.[p.state];
    const show = `${p.state}: ${JSON.stringify(was)} -> ${JSON.stringify(now)}`;
    if ('equals' in p) return { pass: now === p.equals, evidence: show };
    if ('not' in p) return { pass: now !== undefined && now !== p.not, evidence: show };
    if ('in' in p) return { pass: p.in.includes(now), evidence: show };
    if (p.changed) return { pass: now !== was, evidence: show };
    if (p.unchanged) return { pass: now === was, evidence: show };
    throw new Error(`bad state predicate ${JSON.stringify(p)}`);
  },
  exists: (c, f) => ({ pass: f in c.after.files, evidence: `${f} ${f in c.after.files ? 'exists' : 'missing'}` }),
  absent: (c, f) => ({ pass: !(f in c.after.files), evidence: `${f} ${f in c.after.files ? 'exists' : 'absent'}` }),
  unchanged(c, globs) {
    const res = [].concat(globs).map(globRe);
    const hit = [...c.diff.added, ...c.diff.removed, ...c.diff.changed].filter((f) => res.some((r) => r.test(f)));
    return { pass: hit.length === 0, evidence: hit.length ? `changed: ${hit.join(', ')}` : `no change under ${[].concat(globs).join(', ')}` };
  },
  changed(c, globs) {
    const res = [].concat(globs).map(globRe);
    const hit = [...c.diff.added, ...c.diff.removed, ...c.diff.changed].filter((f) => res.some((r) => r.test(f)));
    return { pass: hit.length > 0, evidence: hit.length ? `changed: ${hit.join(', ')}` : 'nothing changed' };
  },
  provenance(c, p) {
    const text = c.read(p.path);
    if (!text) return { pass: false, evidence: `${p.path} missing` };
    const prov = c.records.parseProvenance(text);
    const ok = prov && prov.artifact === p.artifact && (!p.cycle || prov.cycle === p.cycle) && (!p.kind || prov.reviewKind === p.kind);
    return { pass: Boolean(ok), evidence: `provenance ${JSON.stringify(prov)}` };
  },
  heading_ids(c, p) {
    const ids = c.records.headingIds(c.read(p.path) ?? '', p.prefix);
    return { pass: ids.length >= (p.min ?? 1), evidence: `${ids.length} ${p.prefix}-NNN headings in ${p.path}` };
  },
  field(c, p) {
    const text = c.read(p.path);
    if (!text) return { pass: false, evidence: `${p.path} missing` };
    const v = c.records.headerFields(text)[p.name];
    const pass = 'equals' in p ? v === p.equals : v !== undefined && v !== p.not;
    return { pass, evidence: `${p.name}=${JSON.stringify(v)} in ${p.path}` };
  },
  contains(c, p) {
    const text = c.read(p.path) ?? '';
    return { pass: new RegExp(p.regex, p.flags ?? '').test(text), evidence: `/${p.regex}/ in ${p.path}` };
  },
  // The turn-end check the stop hook runs. By default only problems that were
  // not there before the run count, so a deliberately broken fixture does not
  // fail every run; "new_only": false demands a fully clean result.
  check_ok(c, want, p) {
    const key = (x) => `${x.file ?? ''}: ${x.message ?? JSON.stringify(x)}`;
    const afterProblems = c.after.checkTurnEnd?.problems ?? [];
    if (afterProblems.some((x) => (x.message ?? '').startsWith(TURN_END_BROKEN))) throw new Error('turn-end check did not run');
    const before = new Set((c.before.checkTurnEnd?.problems ?? []).map(key));
    const counted = afterProblems.map(key).filter((k) => p.new_only === false || !before.has(k));
    const ok = counted.length === 0;
    return { pass: ok === want, evidence: ok ? `turn-end check: no ${p.new_only === false ? '' : 'new '}problems` : `turn-end check: ${counted.join(' | ')}` };
  },
  // No commit, reset, or checkout moved HEAD, however it was done.
  head_unchanged: (c) => ({ pass: c.before.head === c.after.head, evidence: `HEAD ${c.before.head.slice(0, 7)} -> ${c.after.head.slice(0, 7)}` }),
  // Forbidden git commands in command position, including a subagent's.
  // "mutating" means anything that changes the repository, index, working
  // tree, refs, or remote (lib/trace.mjs isMutatingGit); a list names them.
  not_ran_git(c, list) {
    for (const ev of c.trace.events) {
      if (!ev.command) continue;
      const hit = list === 'mutating'
        ? gitInvocations(ev.command).find(isMutatingGit)
        : gitSubcommands(ev.command).find((s) => list.some((f) => gitMatches(s, f)));
      if (hit) {
        const what = typeof hit === 'string' ? hit : `${hit.sub} ${hit.args.join(' ')}`.trim();
        return { pass: false, evidence: `event ${ev.i}${ev.subagent ? ' (subagent)' : ''}: git ${what} in ${JSON.stringify(ev.command.slice(0, 160))}` };
      }
    }
    return { pass: true, evidence: 'no forbidden git command' };
  },
  // The Skill tool was not called for this skill (for example no automatic
  // Reviewer invocation). A copy/paste invocation line in the reply is not a call.
  no_skill_call(c, name) {
    const e = c.trace.events.find((ev) => ev.tool === 'Skill' && String(ev.skill ?? '').replace(/^\//, '') === name);
    return { pass: !e, evidence: e ? `event ${e.i}: Skill ${name}` : `no Skill call for ${name}` };
  },
  // Patterns over everything the agent wrote to the user during the run.
  reply_matches: (c, re, p) => { const m = new RegExp(re, p.flags ?? '').test(c.trace.replyAll); return { pass: m, evidence: `agent text ${m ? 'matches' : 'lacks'} /${re}/` }; },
  reply_not_matches: (c, re, p) => {
    const m = c.trace.replyAll.match(new RegExp(re, p.flags ?? ''));
    return { pass: !m, evidence: m ? `agent text contains ${JSON.stringify(m[0].slice(0, 80))}` : `agent text has no /${re}/` };
  },
  // Regexes appear in this order (for example commit suggestion before invocation).
  reply_order(c, res) {
    const idx = res.map((re) => c.trace.replyAll.search(new RegExp(re, 'm')));
    const pass = idx.every((i) => i >= 0) && idx.every((i, k) => k === 0 || i > idx[k - 1]);
    return { pass, evidence: `positions ${idx.join(', ')}` };
  },
};

export const PREDICATE_NAMES = Object.keys(PREDICATES);

// The predicate a check object names. `state` takes options that are also
// predicate names (`{"state": f, "unchanged": true}`), so it wins when
// present; otherwise exactly one predicate key is allowed. Null when ambiguous
// or unknown.
export function predicateOf(check) {
  if (check && 'state' in check) return 'state';
  const names = Object.keys(check ?? {}).filter((k) => k in PREDICATES);
  return names.length === 1 ? names[0] : null;
}

function evaluate(c, check) {
  const name = predicateOf(check);
  if (!name) return { predicate: '?', pass: false, error: true, evidence: `grader error: no single known predicate in ${JSON.stringify(check)}` };
  try {
    return { predicate: name, ...PREDICATES[name](c, check[name], check), why: check.why };
  } catch (error) {
    return { predicate: name, pass: false, error: true, evidence: `grader error: ${error.message}` };
  }
}

export async function grade(runDir, specDir, { judge = 'off' } = {}) {
  const spec = readJson(path.join(specDir, 'spec.json'));
  const kase = findCase(spec.case);
  if (!existsSync(path.join(runDir, 'transcript.jsonl'))) {
    return { case: spec.case, status: 'ERROR', error: 'missing transcript', assertions: [] };
  }
  const c = await context(runDir, specDir);
  // Variables from shared bases, then the case's own.
  const vars = resolveSpec(specDir).vars;
  const fxFile = path.join(runDir, 'fixture.json');
  const commits = existsSync(fxFile) ? readJson(fxFile).revisions?.commits ?? {} : {};
  const resolve = (x) => substituteRevisions(substitute(x, vars), commits);
  const byAssertion = new Map((spec.checks ?? []).map((ch) => [ch.assertion, resolve(ch)]));
  const assertions = kase.assertions.map((text, i) => {
    const ch = byAssertion.get(i) ?? { complete: false, all: [] };
    if (ch.na) return { i, text, verdict: 'NA', grader: 'none', reason: ch.na_reason ?? 'not observable in one run', checks: [] };
    const results = (ch.all ?? []).map((p) => evaluate(c, p));
    const errored = results.find((r) => r.error);
    const failed = results.find((r) => !r.pass && !r.error);
    let verdict;
    if (errored) verdict = 'ERROR';
    else if (failed) verdict = 'FAIL';
    else if (ch.complete) verdict = 'PASS';
    else verdict = 'NEEDS_JUDGE';
    return { i, text, verdict, grader: verdict === 'NEEDS_JUDGE' ? 'judge' : 'deterministic', checks: results };
  });
  // Each runtime sentinel adds an invariant: its marker must not appear.
  const sentinels = (spec.runtime?.sentinels ?? []).map((s) => ({ absent: s.marker, why: `sentinel: ${s.why ?? 'must not run'}` }));
  const invariants = [...(spec.invariants ?? []), ...sentinels].map((p) => evaluate(c, resolve(p)));
  // Would a run that did nothing fail this assertion's own checks? The judge
  // checks use only such assertions (or ones whose wording needs action) for
  // their "empty run" known negatives, since an honest judge passes an empty
  // run on "does not edit". Evaluated on the before-state with no tool calls
  // and no text: 'fails', 'passes', 'unknown' (a file's earlier content was
  // not available), or 'no-checks'.
  const c0 = { ...c, after: c.before, diff: { added: [], removed: [], changed: [] }, trace: EMPTY_TRACE, read: readBefore(runDir, c) };
  for (const a of assertions) {
    const ch = byAssertion.get(a.i);
    if (!ch || ch.na || !(ch.all ?? []).length) { a.doNothing = ch?.na ? 'na' : 'no-checks'; continue; }
    const r0 = ch.all.map((p) => evaluate(c0, p));
    a.doNothing = r0.some((r) => r.error) ? 'unknown' : r0.some((r) => !r.pass) ? 'fails' : 'passes';
  }

  if (judge === 'dry') {
    // Write the exact request each judge call would send; nothing is sent.
    const dir = path.join(runDir, 'judge-requests');
    mkdirSync(dir, { recursive: true });
    const { buildJudgeRequest, evidenceParts } = await import('./judge.mjs');
    const parts = evidenceParts({ kase, spec, c });
    // The evidence parts, once per run, for the judge checks (known wrong answers).
    writeFileSync(path.join(runDir, 'judge-evidence.json'), JSON.stringify(parts, null, 2));
    for (const a of assertions.filter((x) => x.verdict === 'NEEDS_JUDGE')) {
      writeFileSync(path.join(dir, `${a.i}.json`), JSON.stringify(buildJudgeRequest(parts, a.text, a.checks), null, 2));
    }
  }
  // Answer-key check: any tool call whose input or output mentions an evals
  // file. Fixtures never contain one, so a hit means the role reached outside
  // (a mirror of the public repo, say); the run is flagged for review.
  // Matches a path into any skills/<role>/evals folder (with or without a
  // trailing slash or file name), evals.json, or the answer key's own field
  // name appearing in a tool's output.
  const answerKeyAccess = c.trace.events
    .filter((e) => /skills\/[\w-]+\/evals\b|evals\.json/.test(JSON.stringify(e.input)) || /skills\/[\w-]+\/evals\b|evals\.json|"expected_output"/.test(e.output ?? ''))
    .map((e) => `event ${e.i}: ${e.tool}`);
  const out = {
    case: spec.case, caseHash: kase.hash, status: 'GRADED', assertions, invariants, answerKeyAccess,
    usage: c.trace.usage, toolCalls: c.trace.events.length, hooks: c.trace.hooks.length, filesChanged: c.diff,
  };
  writeFileSync(path.join(runDir, 'verdicts.json'), JSON.stringify(out, null, 2));
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [runDir, specDir, flag, mode] = process.argv.slice(2);
  const res = await grade(runDir, specDir, { judge: flag === '--judge' ? mode : 'off' });
  for (const a of res.assertions) {
    console.log(`${a.verdict.padEnd(11)} [${a.i}] ${a.text.slice(0, 90)}`);
    for (const r of a.checks) console.log(`            ${r.pass ? 'ok  ' : r.error ? 'ERR ' : 'FAIL'} ${r.predicate}: ${r.evidence}`);
  }
  for (const r of res.invariants ?? []) console.log(`INVARIANT   ${r.pass ? 'ok  ' : r.error ? 'ERR ' : 'FAIL'} ${r.predicate}: ${r.evidence}`);
}
