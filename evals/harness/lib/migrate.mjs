// Mechanical updates that carry a fixture reviewed at an earlier framework
// release to the release under test. Each one changes only what a newer
// release requires and records what it changed; anything that needs judgment
// is left for regeneration instead (migrate-fixtures.mjs).
import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { resolveSpec } from '../build-fixture.mjs';
import { REPO_ROOT, hashOf } from './cases.mjs';

const field = (text, name) => text.match(new RegExp(`\`${name}\`:\\s*\`([^\`]*)\``))?.[1] ?? null;

// Release 0.10.0 made `Active Work.CompletionPolicy` a required STATE.md field
// (PROTOCOL.md, Completion Policies). Releases before it had one completion
// boundary, the full deliverable, so the value that keeps a fixture's meaning:
//   - no cycle (Id UNSET), or an EXPEDITED cycle: NONE;
//   - a STANDARD cycle: FULL_DELIVERABLE;
//   - a finished cycle (CycleMode UNSET with an Id, after sign-off or a
//     retained cancellation) keeps the policy it had ("retained cancellation
//     preserves the cycle's policy"): the one an earlier state of the same
//     cycle in this fixture shows (`known`, by cycle Id); otherwise
//     FULL_DELIVERABLE when it was a standard cycle (it was promoted, it left
//     a state only standard cycles have, or it has a scope or architecture
//     record), and NONE when it was expedited.
// Returns the new text and the value, or a reason it was left alone.
const STANDARD_ONLY_STATES = new Set(['AUDITING', 'SCOPING', 'ARCHITECTING', 'TESTING', 'DOCUMENTING', 'REVIEWING_FINAL', 'SYNCHRONIZING']);
const section = (text, name) => {
  const at = text.search(new RegExp(`^## ${name}\\s*$`, 'm'));
  if (at < 0) return '';
  const next = text.slice(at + 1).search(/^## /m);
  return next < 0 ? text.slice(at) : text.slice(at, at + 1 + next);
};
export function addCompletionPolicy(text, known = new Map()) {
  if (/`CompletionPolicy`:/.test(text)) return { text, skipped: 'already has CompletionPolicy' };
  const heading = text.search(/^## Active Work\s*$/m);
  if (heading < 0) return { text, skipped: 'no Active Work section' };
  const idAt = text.indexOf('`Id`:', heading);
  if (idAt < 0) return { text, skipped: 'no Active Work Id field' };
  const id = field(text.slice(idAt), 'Id');
  const cycleMode = field(text, 'CycleMode');
  const active = section(text, 'Active Work');
  let value;
  if (id === 'UNSET' || cycleMode === 'EXPEDITED' || cycleMode === 'DOCUMENTATION') value = 'NONE';
  else if (cycleMode === 'STANDARD') value = 'FULL_DELIVERABLE';
  else if (cycleMode === 'UNSET') {
    const promoted = !['NONE', null].includes(field(active, 'PromotionReason'));
    const from = field(section(text, 'Handoff'), 'From');
    const records = ['Scope', 'Architecture'].some((k) => !['NONE', null].includes(field(active, k)));
    value = known.get(id) ?? (promoted || STANDARD_ONLY_STATES.has(from) || records ? 'FULL_DELIVERABLE' : 'NONE');
  } else return { text, skipped: `unrecognized CycleMode ${cycleMode}` };
  // The 0.10.0 template puts it first in Active Work, before Id. When Id
  // starts a line it gets a line of its own, so the lines a fixture's
  // self-checks or records quote stay as they were.
  const ownLine = idAt === 0 || text[idAt - 1] === '\n';
  return { text: `${text.slice(0, idAt)}\`CompletionPolicy\`: \`${value}\`${ownLine ? '\n' : ' '}${text.slice(idAt)}`, value };
}

// What a state says a cycle's policy is, for later states of the same cycle.
function policyOf(text) {
  const id = field(section(text, 'Active Work'), 'Id');
  if (!id || id === 'UNSET') return null;
  const policy = field(section(text, 'Active Work'), 'CompletionPolicy');
  const mode = field(text, 'CycleMode');
  const value = policy ?? (mode === 'STANDARD' ? 'FULL_DELIVERABLE' : mode === 'EXPEDITED' ? 'NONE' : null);
  return value ? { id, value } : null;
}

// Every .standards/STATE.md under a directory, as relative paths.
function statesUnder(root) {
  const out = [];
  const walk = (rel) => {
    let names;
    try { names = readdirSync(path.join(root, rel)); } catch { return; }
    for (const name of names.sort()) {
      const r = path.join(rel, name);
      const st = lstatSync(path.join(root, r));
      if (st.isDirectory()) walk(r);
      else if (st.isFile() && r.endsWith(path.join('.standards', 'STATE.md'))) out.push(r);
    }
  };
  walk('');
  return out;
}

// Adds the field to each STATE.md this spec dir's own layers write, reading
// every earlier state in the build order (the bases' layers first) for the
// policies finished cycles keep.
export function migrateStateFiles(specDir) {
  const changes = [];
  const known = new Map();
  for (const layer of resolveSpec(specDir).layers) {
    if (!layer.dir) continue;
    const root = path.join(layer.from, layer.dir);
    const own = path.resolve(layer.from) === path.resolve(specDir);
    for (const rel of statesUnder(root)) {
      const file = path.join(root, rel);
      let text = readFileSync(file, 'utf8');
      if (own) {
        const r = addCompletionPolicy(text, known);
        if (r.value) { writeFileSync(file, r.text); text = r.text; }
        changes.push({ file: path.join(layer.dir, rel), completionPolicy: r.value ?? null, ...(r.skipped ? { skipped: r.skipped } : {}) });
      }
      const p = policyOf(text);
      if (p) known.set(p.id, p.value);
    }
  }
  return changes;
}

// A stub `standards` CLI (runtime.standardsCli.mode "stub") that reported the
// installed release's version, as a global CLI matching the install, keeps
// matching it: `VERSION = '<old>'` becomes the new release's version, and so
// do ground-truth facts that state that version. Returns what changed.
const releaseVersion = (sha) => {
  try { return JSON.parse(execFileSync('git', ['show', `${sha}:package.json`], { cwd: REPO_ROOT, encoding: 'utf8' })).version; } catch { return null; }
};
export function updateStubVersions(specDir, spec, fromSha, toSha) {
  const script = spec.runtime?.standardsCli?.mode === 'stub' ? spec.runtime.standardsCli.script : null;
  const before = fromSha && releaseVersion(fromSha);
  const after = releaseVersion(toSha);
  if (!script || !before || !after || before === after) return [];
  const file = path.join(specDir, script);
  const text = readFileSync(file, 'utf8');
  const constant = new RegExp(`(\\bVERSION\\s*=\\s*['"])${before.replace(/\./g, '\\.')}(['"])`);
  if (!constant.test(text)) return [];
  writeFileSync(file, text.replace(constant, `$1${after}$2`));
  const changed = [`${script}: VERSION ${before} -> ${after}`];
  const mention = `\\bversion ${before.replace(/\./g, '\\.')}\\b`;
  spec.graderOnly = (spec.graderOnly ?? []).map((f) => {
    if (!new RegExp(mention).test(f)) return f;
    changed.push(`graderOnly: "version ${before}" -> "version ${after}"`);
    return f.replace(new RegExp(mention, 'g'), `version ${after}`);
  });
  return changed;
}

// The installer writes a managed block (between the two markers) into
// AGENTS.md. A layer that replaces AGENTS.md carries the block of the release
// the fixture was written for, which would put that older text back over the
// current install. Where a layer file holds the older release's block text
// verbatim, it is replaced with the current release's, and anything the layer
// adds after it inside the block stays. A block that differs from the older
// release's text is left alone: the case changed it on purpose (for example,
// an older-release block that the role must notice).
const START = '<!-- standards:start -->';
const END = '<!-- standards:end -->';
const blockBody = (text) => {
  const a = text.indexOf(START);
  const b = text.indexOf(END, a);
  return a < 0 || b < 0 ? null : text.slice(a + START.length, b).trimEnd();
};
const templateBody = (sha) => {
  try { return blockBody(execFileSync('git', ['show', `${sha}:templates/common/AGENTS.md`], { cwd: REPO_ROOT, encoding: 'utf8' })); } catch { return null; }
};

export function updateManagedBlocks(specDir, fromSha, toSha) {
  const before = fromSha && templateBody(fromSha);
  const after = templateBody(toSha);
  if (!before || !after || before === after) return [];
  const changed = [];
  const walk = (rel) => {
    let names;
    try { names = readdirSync(path.join(specDir, rel)); } catch { return; }
    for (const name of names.sort()) {
      const r = path.join(rel, name);
      const st = lstatSync(path.join(specDir, r));
      if (st.isDirectory()) { walk(r); continue; }
      if (!st.isFile() || !/\.md$/.test(name)) continue;
      const text = readFileSync(path.join(specDir, r), 'utf8');
      const at = text.indexOf(START);
      if (at < 0 || !text.startsWith(before, at + START.length)) continue;
      writeFileSync(path.join(specDir, r), text.slice(0, at + START.length) + after + text.slice(at + START.length + before.length));
      changed.push(r);
    }
  };
  walk('layers');
  return changed;
}

// Every committed version of a role's eval cases, newest first, so a fixture's
// recorded caseHash can be matched to the exact case text it was written for.
const versions = new Map();
function caseVersions(role) {
  if (versions.has(role)) return versions.get(role);
  const rel = `skills/${role}/evals/evals.json`;
  const shas = execFileSync('git', ['log', '--format=%H', '--', rel], { cwd: REPO_ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  const list = shas.map((sha) => {
    try { return JSON.parse(execFileSync('git', ['show', `${sha}:${rel}`], { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 1 << 26 })).evals; } catch { return []; }
  });
  versions.set(role, list);
  return list;
}

// How a case changed since a fixture was written for it (`oldHash`):
//   { kind: 'same' }
//   { kind: 'appended', added: [i, ...] }  same prompt and summary, assertions
//       only added at the end: the fixture still realizes the case, and the
//       new assertions go to the judge;
//   { kind: 'changed', detail }            anything else, or the old text was
//       not found in git history: the fixture needs regenerating.
export function caseChange(kase, oldHash) {
  if (kase.hash === oldHash) return { kind: 'same' };
  for (const evals of caseVersions(kase.role)) {
    const c = evals.find((e) => e.id === kase.id);
    if (!c || hashOf({ prompt: c.prompt, expected: c.expected_output, assertions: c.assertions }) !== oldHash) continue;
    const prefix = kase.assertions.slice(0, c.assertions.length);
    if (c.prompt === kase.prompt && c.expected_output === kase.expected && kase.assertions.length > c.assertions.length
      && JSON.stringify(prefix) === JSON.stringify(c.assertions)) {
      return { kind: 'appended', added: kase.assertions.map((_, i) => i).slice(c.assertions.length) };
    }
    const what = [c.prompt !== kase.prompt && 'prompt', c.expected_output !== kase.expected && 'expected_output',
      JSON.stringify(c.assertions) !== JSON.stringify(kase.assertions) && 'assertions'].filter(Boolean);
    return { kind: 'changed', detail: `the case's ${what.join(', ')} changed since this fixture was written` };
  }
  return { kind: 'changed', detail: `the case text this fixture was written for (caseHash ${oldHash}) is not in git history` };
}
