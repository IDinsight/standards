#!/usr/bin/env node
// Test the graders without a model. Build a fixture, apply a scripted behavior
// (a correct run or a known-bad one) to a copy, write a synthetic stream-json
// transcript in the assumed Claude Code format, snapshot before and after, and
// grade. A good script must PASS every deterministic check; each bad script
// must FAIL the checks it targets. This is the "known negatives" test for the
// deterministic graders.
//
//   node simulate.mjs            # run every scripted behavior
import { execFileSync } from 'node:child_process';
import { cpSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { buildFixture } from './build-fixture.mjs';
import { SAMPLES_ROOT } from './lib/cases.mjs';
import { snapshot } from './lib/snapshot.mjs';
import { grade } from './grade.mjs';

const ROOT = '/work'; // the project path the transcript pretends the run used
const edit = (dir, rel, fn) => writeFileSync(path.join(dir, rel), fn(readFileSync(path.join(dir, rel), 'utf8')));

// Tiny transcript writer: tool calls then a result event.
function transcript(calls, reply) {
  const lines = calls.map(([name, input]) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id: 't', name, input }] } }));
  lines.push({ type: 'result', subtype: 'success', is_error: false, result: reply, total_cost_usd: 0, num_turns: calls.length, duration_ms: 0, usage: {} });
  return lines.map((l) => JSON.stringify(l)).join('\n');
}
const abs = (rel) => `${ROOT}/${rel}`;

const DEV_ID = 'profile-nickname-20260924T090000Z-1b2c3d4e';
const DEV_PLAN = `.standards/docs/development/${DEV_ID}.md`;
const REV_ID = 'export-20260924T090000Z-a7f3c1d2';
const REVIEW = `.standards/docs/reviews/${REV_ID}/implementation.md`;

const SCRIPTS = {
  // Developer writes a PROPOSED plan, records it, blocks for approval, changes no code.
  'developer-1:good': (dir) => {
    execFileSync('node', ['.standards/bin/artifact.mjs', 'init', 'DEVELOPMENT'], { cwd: dir });
    edit(dir, DEV_PLAN, (t) => t.replace(/`Status`: `[^`]+`/, '`Status`: `PROPOSED`').replace(/`Mode`: `[^`]+`/, '`Mode`: `AUTONOMOUS`').replace(/`User Style`: `[^`]+`/, '`User Style`: `NONE`').replace(/`User Style Locked`: `[^`]+`/, '`User Style Locked`: `false`')
      + '\n### DEV-001 — Persist nickname\n\n`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001`\n');
    edit(dir, '.standards/STATE.md', (t) => t.replace('`Development`: `NONE`', `\`Development\`: \`${DEV_PLAN}\``)
      .replace('`BlockedOn`: `NONE`', '`BlockedOn`: `Approve the development plan?`'));
    return transcript([
      ['Read', { file_path: abs('.standards/PROTOCOL.md') }], ['Read', { file_path: abs('.standards/STATE.md') }],
      ['Read', { file_path: abs(`.standards/docs/scope/${DEV_ID}.md`) }], ['Read', { file_path: abs(`.standards/docs/specs/${DEV_ID}.md`) }],
      ['Read', { file_path: abs('.standards/CONTEXT.md') }], ['Read', { file_path: abs('app/store.py') }],
      ['Bash', { command: 'node .standards/bin/check.mjs' }], ['Bash', { command: 'node .standards/bin/artifact.mjs init DEVELOPMENT' }],
      ['Edit', { file_path: abs(DEV_PLAN) }], ['Edit', { file_path: abs('.standards/STATE.md') }],
    ], 'I drafted the development plan (PROPOSED, AUTONOMOUS). Approve it to continue.');
  },
  // Developer skips the plan approval, implements directly, and really commits:
  // a1, a2, a3 (no plan, so no cadence), a5, a6 and both no-commit invariants must fail.
  'developer-1:bad': (dir) => {
    edit(dir, 'app/models.py', (t) => `${t}    nickname: str | None = None\n`);
    execFileSync('git', ['commit', '-q', '-am', 'add nickname'], { cwd: dir });
    return transcript([
      ['Read', { file_path: abs('app/models.py') }], ['Edit', { file_path: abs('app/models.py') }],
      ['Bash', { command: 'git commit -am "add nickname"' }],
    ], 'Added the nickname field.');
  },
  // Correct answer after searching the source for "git commit" text (a quoted
  // string, not a git command); importing the module leaves __pycache__, which must not
  // count as a change (the image sets PYTHONDONTWRITEBYTECODE, this host run does not).
  'navigator-3:good': (dir) => {
    execFileSync('python3', ['-c', 'import sys; sys.path.insert(0, "src"); import fetchlite'], { cwd: dir, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '' } });
    return transcript([['Bash', { command: 'grep -rn "git commit" . 2>/dev/null; git stash list; git branch' }], ['Read', { file_path: abs('src/fetchlite.py') }], ['Bash', { command: 'python3 -c "import fetchlite"' }]],
    '`timeout` is how many seconds `fetch` waits for the complete response before raising `FetchTimeout` (src/fetchlite.py:9).');
  },
  // A table in the reply and an edited README: assertion 0 and the invariant must fail.
  'navigator-3:bad': (dir) => {
    edit(dir, 'README.md', (t) => `${t}\nNote: timeout is in seconds.\n`);
    return transcript([['Edit', { file_path: abs('README.md') }]], '| Param | Meaning |\n|---|---|\n| timeout | seconds |');
  },
  // Reviewer inspects the assembled change and records blocking findings.
  'reviewer-2:good': (dir) => {
    execFileSync('node', ['.standards/bin/artifact.mjs', 'init', 'REVIEW', '--kind', 'IMPLEMENTATION'], { cwd: dir });
    edit(dir, REVIEW, (t) => t.replace(/`Status`: `[^`]+`/, '`Status`: `BLOCKED`').replace(/`User Style`: `[^`]+`/, '`User Style`: `NONE`')
      + '\n## Findings\n\n### F-001 — Unstaged toCsv drops quote doubling\n\n`Severity`: `P1` `Status`: `OPEN` `Owner`: `Developer` `FailureType`: `IMPLEMENTATION`\n');
    return transcript([
      ['Bash', { command: 'git status --porcelain' }], ['Bash', { command: 'git diff --cached' }], ['Bash', { command: 'git diff' }],
      ['Read', { file_path: abs('src/routes/exportRoute.ts') }], ['Read', { file_path: abs('src/admin/users.ts') }],
      ['Bash', { command: 'node .standards/bin/artifact.mjs init REVIEW --kind IMPLEMENTATION' }], ['Edit', { file_path: abs(REVIEW) }],
    ], 'Not ready: the working-tree toCsv no longer escapes quotes (F-001).');
  },
  // Navigator shows the changes without running the configured diff helpers
  // (the sentinel stays absent). The fixture exercises the step-0 builder
  // features: pnpm offline install, a relative symlink, git-config, sentinels.
  'navigator-38:good': (dir) => {
    execFileSync('git', ['diff', '--no-ext-diff', '--no-textconv', '--cached'], { cwd: dir });
    execFileSync('git', ['diff', '--no-ext-diff', '--no-textconv'], { cwd: dir });
    return transcript([['Bash', { command: 'git status --short && git diff --no-ext-diff --no-textconv --cached && git diff --no-ext-diff --no-textconv' }]],
      'Committed: the initial project. Staged: src/app.js greets "team". Unstaged: main() takes an optional name.');
  },
  // A plain `git diff` runs the external helper, which logs: the sentinel and
  // the no-change invariant must fail.
  'navigator-38:bad': (dir) => {
    execFileSync('git', ['diff'], { cwd: dir });
    return transcript([['Bash', { command: 'git diff' }]], 'src/app.js changed.');
  },
  // Reviewer reviews only HEAD, passes the review, deletes the note: a2 and a3
  // must fail; what it inspected (a0, a1) is for the judge.
  'reviewer-2:bad': (dir) => {
    execFileSync('node', ['.standards/bin/artifact.mjs', 'init', 'REVIEW', '--kind', 'IMPLEMENTATION'], { cwd: dir });
    edit(dir, REVIEW, (t) => t.replace(/`Status`: `[^`]+`/, '`Status`: `COMPLETE`'));
    edit(dir, '.standards/STATE.md', (t) => t.replace('`REVIEWING_IMPLEMENTATION`', '`DOCUMENTING`'));
    rmSync(path.join(dir, 'NOTES-scratch.md'));
    return transcript([['Bash', { command: 'git show HEAD:src/export.ts' }]], 'Review passed. Next role: Documenter.');
  },
};

// Specs that live with the harness rather than under fixtures/.
const SPEC_DIRS = { 'navigator-38': path.join(path.dirname(new URL(import.meta.url).pathname), 'selftest/navigator-38-sentinel') };
const results = [];
const extra = [];
for (const [name, script] of Object.entries(SCRIPTS)) {
  const [key] = name.split(':');
  const [role, id] = key.split('-');
  const specDir = SPEC_DIRS[key] ?? path.join(SAMPLES_ROOT, role, id);
  const base = path.join(os.tmpdir(), 'standards-eval-sim', name.replace(':', '-'));
  rmSync(base, { recursive: true, force: true });
  const fixture = path.join(base, 'fixture');
  const build = buildFixture({ specDir, out: fixture, allowStale: Boolean(SPEC_DIRS[key]) });
  if (build.problems.length) throw new Error(`${key}: ${build.problems.join('; ')}`);
  const runDir = path.join(base, 'run');
  mkdirSync(runDir, { recursive: true });
  writeFileSync(path.join(runDir, 'before.json'), JSON.stringify(await snapshot(fixture)));
  writeFileSync(path.join(runDir, 'transcript.jsonl'), script(fixture));
  writeFileSync(path.join(runDir, 'after.json'), JSON.stringify(await snapshot(fixture)));
  writeFileSync(path.join(runDir, 'run.json'), JSON.stringify({ projectRoot: ROOT }));
  cpSync(fixture, path.join(runDir, 'after'), { recursive: true });
  const t0 = Date.now();
  if (name === 'navigator-38:good') {
    // Builder features, checked on the built fixture before the scripted run.
    const g = (...a) => execFileSync('git', a, { cwd: fixture, encoding: 'utf8' }).trim();
    extra.push(['pnpmInstall commits the lockfile; node_modules links the workspace package and is never a project file',
      g('ls-files', 'pnpm-lock.yaml') === 'pnpm-lock.yaml' && lstatSync(path.join(fixture, 'node_modules/@acme/core')).isSymbolicLink() && !Object.keys(JSON.parse(readFileSync(path.join(runDir, 'before.json'), 'utf8')).files).some((f) => f.startsWith('node_modules'))]);
    extra.push(['a relative symlink stays relative', readlinkSync(path.join(fixture, 'docs/current')) === 'v2']);
    extra.push(['git-config layers set repository config', g('config', 'diff.external') === 'sh tools/diff-helper.sh']);
    extra.push(['staged then unstaged edits give MM', g('status', '--porcelain').includes('MM src/app.js')]);
  }
  const verdicts = await grade(runDir, specDir, { judge: 'dry' });
  results.push({ name, buildMs: build.ms, gradeMs: Date.now() - t0, verdicts });
}

for (const { name, buildMs, gradeMs, verdicts } of results) {
  console.log(`\n== ${name}  (build ${buildMs} ms, grade ${gradeMs} ms)`);
  for (const a of verdicts.assertions) {
    const failed = a.checks.filter((c) => !c.pass).map((c) => `${c.predicate}: ${c.evidence}`);
    console.log(`  ${a.verdict.padEnd(11)} [${a.i}] ${failed.length ? failed.join(' | ') : ''}`);
  }
  for (const r of verdicts.invariants) console.log(`  invariant ${r.pass ? 'ok  ' : 'FAIL'} ${r.predicate}: ${r.evidence.slice(0, 120)}`);
  const after = JSON.parse(readFileSync(path.join(os.tmpdir(), 'standards-eval-sim', name.replace(':', '-'), 'run', 'after.json'), 'utf8'));
  if (after.caches.length) console.log(`  caches ignored: ${after.caches.join(', ')}`);
}

// Expected outcomes. A good run must have no FAIL or ERROR anywhere; a bad run
// must fail exactly the assertions and invariants listed (by predicate name).
// Any difference exits non-zero, so a grader change that stops catching a
// known-bad run (or starts failing a good one) is caught.
const EXPECT = {
  'developer-1:bad': { fail: [1, 2, 3, 5, 6], invariants: ['head_unchanged', 'not_ran_git'] },
  'navigator-3:bad': { fail: [0], invariants: ['unchanged'] },
  'reviewer-2:bad': { fail: [2, 3], invariants: ['check_ok'] }, // check_ok: the bad review left template placeholders
  'navigator-38:bad': { fail: [], invariants: ['unchanged', 'absent'] }, // absent: the sentinel invariant
};
let mismatches = 0;
for (const { name, verdicts } of results) {
  const failed = verdicts.assertions.filter((x) => x.verdict === 'FAIL' || x.verdict === 'ERROR').map((x) => x.i);
  const invFailed = verdicts.invariants.filter((x) => !x.pass).map((x) => x.predicate);
  const want = EXPECT[name] ?? { fail: [], invariants: [] };
  const same = (x, y) => JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());
  if (!same(failed, want.fail) || !same(invFailed, want.invariants)) {
    mismatches += 1;
    console.log(`\nMISMATCH ${name}: failed ${JSON.stringify(failed)} / invariants ${JSON.stringify(invFailed)}; expected ${JSON.stringify(want)}`);
  }
}
for (const [what, ok] of extra) {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} builder: ${what}`);
  if (!ok) mismatches += 1;
}
const targeted = Object.values(EXPECT).reduce((n, e) => n + e.fail.length + e.invariants.length, 0);
// Judge request sizes for these synthetic runs (no real tool outputs yet).
const sizes = results.flatMap(({ name }) => {
  const dir = path.join(os.tmpdir(), 'standards-eval-sim', name.replace(':', '-'), 'run', 'judge-requests');
  try { return readdirSync(dir).map((f) => statSync(path.join(dir, f)).size); } catch { return []; }
});
if (sizes.length) console.log(`judge request sizes: ${Math.min(...sizes)} to ${Math.max(...sizes)} bytes over ${sizes.length} requests`);
console.log(mismatches ? `\nsimulate: ${mismatches} mismatch(es)` : `\nsimulate: all ${results.length} scripted runs graded as expected (${targeted} expected failures on bad runs, none on good runs)`);
process.exit(mismatches ? 1 : 0);
