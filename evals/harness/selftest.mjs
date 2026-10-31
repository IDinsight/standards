#!/usr/bin/env node
// Self-test for the harness's own behavior.
// No model, no Docker. Exits non-zero if any check fails.
//
//   node selftest.mjs
//
// Covers: git-command classification, gate 2 on broken fixture copies, the two
// check.mjs modes, the tester-10 post-resume state, fixture-hash reproducibility
// and index sensitivity, subagent text handling, fresh-process runtime reads,
// the judge merge (unparseable verdict -> ERROR -> INCOMPLETE), N/A handling in
// the summary, the scripted good/bad runs (simulate.mjs), migration edits, git
// on the host (hermetic builds, no repository helpers), Finder files, the
// judge's guards, and committed fixtures.
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildFixture } from './build-fixture.mjs';
import { EVALS_ROOT, REPO_ROOT, SAMPLES_ROOT, loadRole } from './lib/cases.mjs';
import { snapshot } from './lib/snapshot.mjs';
import { gitInvocations, isMutatingGit, parseTranscript } from './lib/trace.mjs';
import { validate } from './validate-fixture.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TMP = path.join(os.tmpdir(), 'standards-eval-selftest');
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
};
const fixture = (role, id) => path.join(SAMPLES_ROOT, role, String(id));
const copySpec = (role, id, name) => { const d = path.join(TMP, name); cpSync(fixture(role, id), d, { recursive: true }); return d; };
const editSpecFile = (dir, rel, fn) => { const f = path.join(dir, rel); writeFileSync(f, fn(readFileSync(f, 'utf8'))); };

// 0. Scripted good and bad runs (known negatives for the graders). First,
// because later checks read the runs it writes.
let simOk = true;
try { execFileSync('node', [path.join(HERE, 'simulate.mjs')], { stdio: 'pipe' }); } catch { simOk = false; }
check('simulate.mjs: good runs clean, bad runs fail exactly the expected checks', simOk);

// 1. Git-command classification: mutating vs read-only, in command position.
const MUTATING = ['git tag v1.0.0', 'git tag -a v1 -m x', 'git branch feature/x', 'git branch fix-1.2', 'git branch -D old',
  'git branch -m new', 'git tag -d v1', 'if true; then git commit -m x; fi', '(git commit -m x)', 'sleep 1 & git commit -m x',
  'xargs git add', 'time git commit -m x', 'git -C . commit -m x', 'GIT_DIR=.git git commit -m x', 'git stash', 'git stash pop',
  'git clean -fd', 'git update-index --assume-unchanged a', 'git config user.name x', 'git remote add o u', 'git worktree add ../w',
  'git symbolic-ref HEAD refs/heads/x', 'git push origin main', 'git fetch', 'git config user.email "bot@example.com"',
  'git config --global user.name "Eval Bot"', 'git symbolic-ref HEAD "refs/heads/x"', 'git branch "feature/x"', 'git tag "v1.0"',
  'git config set user.name x', 'git bisect start', 'git sparse-checkout set src', 'git reflog expire --all'];
const READ_ONLY = ['git clean -n', 'git clean -nd', 'git apply --check p.diff', 'git notes list', 'git branch', 'git branch -a',
  'git branch --contains abc', 'git tag', 'git tag -l', 'git stash list', 'git status', 'grep -n "git commit" f',
  'echo "run git add ."', 'git diff --cached', 'git log --oneline -3', 'cat .git/config', 'git config user.name',
  'git remote -v', 'git worktree list', 'git symbolic-ref HEAD', 'git rev-parse HEAD', 'git config -f .gitmodules submodule.x.url',
  'git config --type bool core.bare', 'git config get user.name', 'git reflog', 'git sparse-checkout list', 'git commit --help | head -1 && echo "git commit"'];
const wrong = [...MUTATING.filter((c) => !gitInvocations(c).some(isMutatingGit)).map((c) => `missed: ${c}`),
  ...READ_ONLY.filter((c) => gitInvocations(c).some(isMutatingGit)).map((c) => `false alarm: ${c}`)];
check(`git classification over ${MUTATING.length + READ_ONLY.length} commands`, wrong.length === 0, wrong.join('; '));

// 2. Gate 2 on deliberately broken copies.
const devTesting = copySpec('developer', 1, 'dev-testing');
editSpecFile(devTesting, 'layers/10-workflow/.standards/STATE.md', (t) => t.replace('`WorkflowState`: `DEVELOPING`', '`WorkflowState`: `TESTING`'));
const r1 = await validate(devTesting);
check('gate 2 catches a wrong WorkflowState (developer-1 -> TESTING)', r1.problems.some((p) => /WorkflowState: prompt says DEVELOPING/.test(p)));
const revTesting = copySpec('reviewer', 2, 'rev-testing');
editSpecFile(revTesting, 'layers/10-cycle/.standards/STATE.md', (t) => t.replace('`WorkflowState`: `REVIEWING_IMPLEMENTATION`', '`WorkflowState`: `TESTING`'));
const r2 = await validate(revTesting);
check('gate 2 catches reviewer-2 -> TESTING, which check.mjs accepts', r2.problems.some((p) => /WorkflowState/.test(p)) && !r2.problems.some((p) => /check\.mjs/.test(p)));
const revNoUnstaged = copySpec('reviewer', 2, 'rev-no-unstaged');
rmSync(path.join(revNoUnstaged, 'layers/30-unstaged/src'), { recursive: true, force: true });
const r3 = await validate(revNoUnstaged);
check('gate 2 limit: a removed unstaged edit is not caught (the deletion still counts as unstaged)', r3.problems.length === 0);

// 3. check.mjs modes: full mode flags a COMPLETE record the next role owns; turn-end mode doesn't.
const modes = path.join(TMP, 'modes');
buildFixture({ specDir: fixture('developer', 1), out: modes });
cpSync(path.join(REPO_ROOT, 'test/fixtures/upgrade/standard-documenting/.standards'), path.join(modes, '.standards'), { recursive: true });
rmSync(path.join(modes, '.standards/CONTEXT.md'), { force: true });
const docRec = execFileSync('ls', [path.join(modes, '.standards/docs/documentation')], { encoding: 'utf8' }).trim();
editSpecFile(modes, `.standards/docs/documentation/${docRec}`, (t) => t.replace(/`Status`: `[A-Z_]+`/, '`Status`: `COMPLETE`'));
const ms = await snapshot(modes);
check('full check flags a COMPLETE documentation record; turn-end check accepts it',
  ms.check.problems.some((p) => /is COMPLETE but does not account for AC-001/.test(p.message)) && ms.checkTurnEnd.problems.length === 0);

// 3b. Recovery frames and obligations are exposed as plain state fields for `state` checks.
{
  const fr = path.join(TMP, 'frames');
  buildFixture({ specDir: fixture('developer', 1), out: fr });
  cpSync(path.join(REPO_ROOT, 'test/fixtures/upgrade/standard-recovery/.standards'), path.join(fr, '.standards'), { recursive: true });
  const st = (await snapshot(fr)).state;
  check('state fields: Recovery.FrameCount, Recovery.Frame1.*, Recovery.Top.*, Obligations.Count',
    st['Recovery.FrameCount'] === '1' && st['Recovery.Frame1.Owner'] === 'ARCHITECTING' && st['Recovery.Top.ResumeAt'] === 'TESTING' && st['Obligations.Count'] === '0', JSON.stringify(st).slice(0, 200));
}

// 3c. A list-valued BaselineReconciliation is exposed as a state field (it once
// read as undefined, so every check on it failed, and its SourceCycle leaked
// out as ActiveWork.SourceCycle).
{
  const bl = path.join(TMP, 'baseline-list');
  buildFixture({ specDir: fixture('developer', 1), out: bl });
  const sf = path.join(bl, '.standards/STATE.md');
  writeFileSync(sf, readFileSync(sf, 'utf8').replace(/`BaselineReconciliation`: `NONE`/,
    '`BaselineReconciliation`:\n\n- `SourceCycle`: `old-cycle-20260101T000000Z-aaaaaaaa`\n  `Request`: `Old work.`'));
  const st = (await snapshot(bl)).state;
  check('state fields: a BaselineReconciliation list reads as its source cycles, with a count and entries',
    st['ActiveWork.BaselineReconciliation'] === 'old-cycle-20260101T000000Z-aaaaaaaa' && st['ActiveWork.BaselineReconciliation.Count'] === '1'
      && st['ActiveWork.BaselineReconciliation.Entry1.Request'] === 'Old work.' && !('ActiveWork.SourceCycle' in st), JSON.stringify(st).slice(0, 300));
}

// 4. tester-10: the state its expected resume leads to fails check.mjs.
const t10 = buildFixture({ specDir: path.join(HERE, 'selftest/tester-10-post-resume'), out: path.join(TMP, 't10'), allowStale: true });
check('tester-10 post-resume state: check.mjs reports the stale implementation review', t10.problems.length === 0
  && t10.check.problems.some((p) => /implementation\.md/.test(p.file ?? '') && /does not account for AC-004/.test(p.message)));

// 5. Fixture hash: reproducible, and sensitive to staged vs unstaged.
const hA = buildFixture({ specDir: fixture('reviewer', 2), out: path.join(TMP, 'hA') }).fixtureHash;
const hB = buildFixture({ specDir: fixture('reviewer', 2), out: path.join(TMP, 'hB') }).fixtureHash;
const unstagedOnly = copySpec('reviewer', 2, 'rev-unstaged-only');
editSpecFile(unstagedOnly, 'spec.json', (t) => t.replace('"action": "stage"', '"action": "unstaged"'));
const hC = buildFixture({ specDir: unstagedOnly, out: path.join(TMP, 'hC') }).fixtureHash;
check('fixture hash is identical across builds and differs when staged becomes unstaged', hA === hB && hA !== hC, `${hA} ${hB} ${hC}`);

// 6. Subagent text never reaches the reply; a subagent's commit is still seen.
const tfile = path.join(TMP, 'sub.jsonl');
writeFileSync(tfile, [
  { type: 'assistant', parent_tool_use_id: null, message: { content: [{ type: 'text', text: 'Looking into it.' }, { type: 'tool_use', id: 'a1', name: 'Task', input: {} }] } },
  { type: 'assistant', parent_tool_use_id: 'a1', message: { content: [{ type: 'text', text: '| file | line |' }, { type: 'tool_use', id: 's1', name: 'Bash', input: { command: 'git -C . commit -m x' } }] } },
  { type: 'system', subtype: 'hook_response' },
  { type: 'assistant', parent_tool_use_id: null, message: { content: [{ type: 'text', text: 'Done.' }] } },
  { type: 'result', subtype: 'success', result: 'Done.', total_cost_usd: 0.1 },
].map((x) => JSON.stringify(x)).join('\n'));
const tr = parseTranscript(tfile, '/work');
check('subagent text excluded from agent text; subagent commit still detected; true order kept',
  !tr.replyAll.includes('| file |') && tr.events.some((e) => e.subagent && gitInvocations(e.command ?? '').some(isMutatingGit))
  && tr.hooks[0].seq > tr.events[1].seq && tr.texts.at(-1).seq > tr.hooks[0].seq);

// 6b. Answer-key scan: a folder path, evals.json, or the answer key's field
// name in an output is flagged; the simulated runs are not.
{
  const { grade } = await import('./grade.mjs');
  const ak = path.join(TMP, 'answerkey');
  buildFixture({ specDir: fixture('navigator', 3), out: path.join(ak, 'after') });
  const snap = await snapshot(path.join(ak, 'after'));
  writeFileSync(path.join(ak, 'before.json'), JSON.stringify(snap));
  writeFileSync(path.join(ak, 'after.json'), JSON.stringify(snap));
  writeFileSync(path.join(ak, 'run.json'), JSON.stringify({ projectRoot: '/work' }));
  const events = [
    { type: 'assistant', message: { content: [{ type: 'tool_use', id: 'x1', name: 'Bash', input: { command: 'cd /tmp/m/skills/navigator/evals && cat *.json' } }] } },
    { type: 'assistant', message: { content: [{ type: 'tool_use', id: 'x2', name: 'Bash', input: { command: 'cat /tmp/dump.txt' } }] } },
    { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'x2', content: '{"id": 3, "expected_output": "..."}' }] } },
    { type: 'result', subtype: 'success', result: 'ok', total_cost_usd: 0 },
  ];
  writeFileSync(path.join(ak, 'transcript.jsonl'), events.map((x) => JSON.stringify(x)).join('\n'));
  const res = await grade(ak, fixture('navigator', 3));
  const simRuns = ['developer-1-good', 'navigator-3-good', 'reviewer-2-good'].map((n) => JSON.parse(readFileSync(path.join(os.tmpdir(), 'standards-eval-sim', n, 'run/verdicts.json'), 'utf8')));
  check('answer-key scan flags a cd into an evals folder and an answer-key field in output; ordinary runs are not flagged',
    res.answerKeyAccess.length === 2 && simRuns.every((r) => r.answerKeyAccess.length === 0), JSON.stringify(res.answerKeyAccess));
}

// 7. Pristine runtime: a role's edit to the project's .standards/bin (check.mjs
// or its record parser) never changes what the harness checks or runs on the
// host; unreadable files don't crash.
const fresh = path.join(TMP, 'fresh');
buildFixture({ specDir: fixture('developer', 1), out: fresh });
const before = await snapshot(fresh);
const marker = path.join(TMP, 'host-ran-project-code');
rmSync(marker, { force: true });
editSpecFile(fresh, '.standards/bin/check.mjs', (t) => t.replace('export async function runCheck(root, { atTurnEnd = false } = {}) {',
  `export async function runCheck(root, { atTurnEnd = false } = {}) { (await import('node:fs')).writeFileSync(${JSON.stringify(marker)}, 'x'); return { problems: [], notes: [] };`));
editSpecFile(fresh, '.standards/STATE.md', (t) => `${t}\n<!-- edited -->\n`);
editSpecFile(fresh, '.standards/bin/lib/records.mjs', (t) => `(await import('node:fs')).writeFileSync(${JSON.stringify(marker)}, 'x');\n${t}`);
writeFileSync(path.join(fresh, 'locked.txt'), 'x');
chmodSync(path.join(fresh, 'locked.txt'), 0o000);
const after = await snapshot(fresh);
chmodSync(path.join(fresh, 'locked.txt'), 0o644);
check('snapshots read and check with the pinned framework\'s pristine runtime, never the project\'s edited copy; an unreadable file is recorded',
  before.checkTurnEnd.ok && !existsSync(marker) && after.check.problems.length === before.check.problems.length && after.state.WorkflowState === before.state.WorkflowState && 'locked.txt' in after.files);
{
  // A Python virtual environment, under any name, is a cache like
  // node_modules; a directory without pyvenv.cfg is still project content.
  const { manifest } = await import('./lib/snapshot.mjs');
  const vr = path.join(TMP, 'venv-project');
  for (const d of ['.venv/lib/python3.11/site-packages', 'env/lib', 'venv/lib']) mkdirSync(path.join(vr, d), { recursive: true });
  for (const f of ['.venv/pyvenv.cfg', '.venv/lib/python3.11/site-packages/x.py', 'env/pyvenv.cfg', 'env/lib/y.py', 'venv/lib/z.py', 'app.py']) writeFileSync(path.join(vr, f), 'x\n');
  const vc = [];
  const vf = Object.keys(manifest(vr, vc));
  check('snapshot: a Python virtual environment (a directory holding pyvenv.cfg), under any name, is a cache; a plain directory is not',
    JSON.stringify(vf) === '["app.py","venv/lib/z.py"]' && JSON.stringify(vc.sort()) === '[".venv","env"]', `${JSON.stringify(vf)} ${JSON.stringify(vc)}`);
}


// 9. Judge merge and summary on simulated runs: unparseable verdict -> ERROR -> INCOMPLETE; NA excluded.
const sumDir = path.join(TMP, 'sum');
const simRoot = path.join(os.tmpdir(), 'standards-eval-sim');
mkdirSync(path.join(sumDir, 'cases/navigator-3'), { recursive: true });
mkdirSync(path.join(sumDir, 'cases/developer-1'), { recursive: true });
cpSync(path.join(simRoot, 'navigator-3-good/run'), path.join(sumDir, 'cases/navigator-3/r1'), { recursive: true });
cpSync(path.join(simRoot, 'developer-1-good/run'), path.join(sumDir, 'cases/developer-1/r1'), { recursive: true });
for (const k of ['navigator-3', 'developer-1']) writeFileSync(path.join(sumDir, `cases/${k}/r1/usage.json`), JSON.stringify({ costUsd: 0.5, wallMs: 60000 }));
const resp = path.join(TMP, 'resp-nav');
mkdirSync(resp);
writeFileSync(path.join(resp, '0.json'), JSON.stringify({ verdict: 'MAYBE' }));
writeFileSync(path.join(resp, '1.json'), JSON.stringify({ verdict: 'PASS', evidence: [], rationale: 'x' }));
execFileSync('node', [path.join(HERE, 'apply-judge.mjs'), path.join(sumDir, 'cases/navigator-3/r1'), '--responses', resp]);
// developer-1: mark assertion 4 NA by hand, judge the rest PASS.
const dv = path.join(sumDir, 'cases/developer-1/r1/verdicts.json');
const v = JSON.parse(readFileSync(dv, 'utf8'));
v.assertions[4].verdict = 'NA';
writeFileSync(dv, JSON.stringify(v));
const respDev = path.join(TMP, 'resp-dev');
mkdirSync(respDev);
for (const i of [0, 5]) writeFileSync(path.join(respDev, `${i}.json`), JSON.stringify({ verdict: 'PASS', evidence: [], rationale: 'x' }));
execFileSync('node', [path.join(HERE, 'apply-judge.mjs'), path.join(sumDir, 'cases/developer-1/r1'), '--responses', respDev]);
execFileSync('node', [path.join(HERE, 'summarize.mjs'), sumDir], { stdio: 'pipe' });
const summary = JSON.parse(readFileSync(path.join(sumDir, 'summary.json'), 'utf8'));
const nav = summary.cases.find((x) => x.key === 'navigator-3');
const dev = summary.cases.find((x) => x.key === 'developer-1');
check('unparseable judge verdict -> ERROR -> case INCOMPLETE; NA excluded from the case total and status',
  nav.status === 'INCOMPLETE' && nav.failed.includes('0:ERROR') && dev.status === 'PASS' && dev.na === 1 && dev.total === 6);

// 10. One role at a time: --role runs that role's cases and lists the rest
// (catalog/deferred.json, or no fixture yet) as NOT_RUN with a reason (dry run; no model).
{
  const id = 'selftest-role';
  try {
    execFileSync('node', [path.join(HERE, 'run.mjs'), '--role', 'tester', '--run-id', id, '--allow-draft'], { stdio: 'pipe' });
    const res = JSON.parse(readFileSync(path.join(EVALS_ROOT, 'runs', id, 'results.json'), 'utf8'));
    const deferred = res.filter((r) => r.status === 'NOT_RUN' && !/no fixture spec/.test(r.error)).map((r) => r.key).sort();
    const listed = Object.keys(JSON.parse(readFileSync(path.join(EVALS_ROOT, 'catalog/deferred.json'), 'utf8')).deferred).filter((k) => k.startsWith('tester-')).sort();
    check('--role tester lists every tester case; deferred ones and ones without fixtures as NOT_RUN with a reason',
      res.length === loadRole('tester').length && JSON.stringify(deferred) === JSON.stringify(listed) && res.every((r) => r.status !== 'NOT_RUN' || r.error), deferred.join(', '));
  } finally {
    rmSync(path.join(EVALS_ROOT, 'runs', id), { recursive: true, force: true });
    try { execFileSync('rmdir', [path.join(EVALS_ROOT, 'runs')], { stdio: 'ignore' }); } catch { /* not empty or absent */ }
  }
}

// Finder's .DS_Store: never part of a fixture build, and never mistaken for a
// case folder by the commands that read a run.
{
  const { specDirHash } = await import('./build-fixture.mjs');
  const { pendingJudgeCalls } = await import('./judge-run.mjs');
  const { collectJudged } = await import('./judge-checks.mjs');
  const ds = copySpec('reviewer', 2, 'rev-ds-store');
  const layer = JSON.parse(readFileSync(path.join(ds, 'spec.json'), 'utf8')).layers.find((l) => l.dir).dir;
  writeFileSync(path.join(ds, layer, '.DS_Store'), 'finder');
  writeFileSync(path.join(ds, '.DS_Store'), 'finder');
  const hDs = buildFixture({ specDir: ds, out: path.join(TMP, 'hDs') }).fixtureHash;
  writeFileSync(path.join(sumDir, 'cases/.DS_Store'), 'finder');
  let readsRun = true;
  try {
    pendingJudgeCalls(sumDir);
    collectJudged([sumDir]);
    execFileSync('node', [path.join(HERE, 'summarize.mjs'), sumDir], { stdio: 'pipe' });
    execFileSync('node', [path.join(HERE, 'spend.mjs'), sumDir], { stdio: 'pipe', env: { ...process.env, EVAL_SPEND_LOG: path.join(TMP, 'no-spend.jsonl') } });
  } catch { readsRun = false; }
  check('.DS_Store: one in a layer or spec dir changes neither the build hash nor the spec hash; one in a run\'s cases folder breaks no command that reads the run',
    hDs === hA && specDirHash(ds) === specDirHash(fixture('reviewer', 2)) && readsRun, `${hDs} ${hA}`);
}

// Git as the harness runs it: a fixture builds to the same hash whatever your
// global git config says (here core.autocrlf and a global ignore of *.md).
// Without the harness's settings (EVAL_GIT_HERMETIC already set) it would not.
{
  const { userGitEnv } = await import('./lib/config.mjs');
  const globalCfg = path.join(TMP, 'hostile.gitconfig');
  writeFileSync(path.join(TMP, 'hostile.ignore'), '*.md\n');
  writeFileSync(globalCfg, `[core]\n\tautocrlf = true\n\texcludesFile = ${path.join(TMP, 'hostile.ignore')}\n`);
  const hashUnder = (extra) => {
    try {
      return execFileSync('node', ['--input-type=module', '-e',
        `const { buildFixture } = await import(${JSON.stringify(path.join(HERE, 'build-fixture.mjs'))});
         console.log(buildFixture({ specDir: ${JSON.stringify(fixture('reviewer', 2))}, out: ${JSON.stringify(path.join(TMP, 'hHostile'))} }).fixtureHash);`],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...userGitEnv(), GIT_CONFIG_GLOBAL: globalCfg, ...extra } }).trim().split('\n').at(-1);
    } catch (error) { return `build failed: ${String(error.stderr ?? error.message).slice(0, 200)}`; }
  };
  const hermetic = hashUnder({});
  const exposed = hashUnder({ EVAL_GIT_HERMETIC: '1' });
  check('hermetic git: a fixture builds to its usual hash under a hostile global git config, and would not without the harness\'s git settings',
    hermetic === hA && exposed !== hA, `${hermetic} ${exposed} ${hA}`);
}

// Git on a run's repository, on your machine: the key scan never runs the
// repository's own diff helpers (a textconv or external diff the role set up
// would run on the host, and what it wrote would be graded as the role's), and
// config git cannot switch off per command (filters, includes) is reported.
{
  const { gitHolds } = await import('./lib/credentials.mjs');
  const { unsafeGitConfig } = await import('./lib/snapshot.mjs');
  const repo = path.join(TMP, 'helpers');
  const marker = path.join(TMP, 'helper-ran');
  const g = (args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  mkdirSync(repo, { recursive: true });
  g(['init', '-q']);
  g(['config', 'user.email', 'selftest@example.com']);
  g(['config', 'user.name', 'selftest']);
  writeFileSync(path.join(repo, '.gitattributes'), '*.txt diff=probe\n');
  writeFileSync(path.join(repo, 'a.txt'), 'one\n');
  g(['add', '-A']);
  g(['commit', '-qm', 'one']);
  writeFileSync(path.join(repo, 'a.txt'), 'two\n');
  g(['add', 'a.txt']);
  g(['config', 'diff.probe.textconv', `touch '${marker}.textconv'; cat`]);
  g(['config', 'diff.external', `touch '${marker}.external'; true`]);
  const clean = unsafeGitConfig(repo);
  // Control: plain git runs both helpers.
  g(['log', '-p']);
  g(['diff', '--cached']);
  const control = existsSync(`${marker}.textconv`) && existsSync(`${marker}.external`);
  rmSync(`${marker}.textconv`, { force: true });
  rmSync(`${marker}.external`, { force: true });
  const held = gitHolds(repo, (r, a) => execFileSync('git', a, { cwd: r, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }), { key: 'sk-selftest-not-present' });
  const ran = existsSync(`${marker}.textconv`) || existsSync(`${marker}.external`);
  g(['config', 'filter.x.clean', 'cat']);
  g(['config', 'include.path', '../elsewhere']);
  const flagged = unsafeGitConfig(repo);
  check('host git: the key scan runs no textconv or external diff the repository configured; filters and includes in its config are reported',
    control && !ran && held === false && clean.length === 0 && JSON.stringify(flagged.sort()) === '["filter.x.clean","include.path"]', JSON.stringify({ control, ran, held, clean, flagged }));
}

// The judge never grades its own model's runs, and the second judge is never
// the judge. No key reaches these commands, so none can make a call.
{
  const { JUDGE_MODEL } = await import('./judge.mjs');
  const safe = { ...process.env, ANTHROPIC_API_KEY: '', EVAL_ENV_FILE: path.join(TMP, 'no.env'), EVAL_ALLOW_MODEL: '' };
  const runDir = path.join(TMP, 'self-graded');
  mkdirSync(path.join(runDir, 'cases'), { recursive: true });
  writeFileSync(path.join(runDir, 'run.json'), JSON.stringify({ model: JUDGE_MODEL }));
  const jr = spawnSync('node', [path.join(HERE, 'judge-run.mjs'), runDir], { encoding: 'utf8', env: safe });
  const jc = spawnSync('node', [path.join(HERE, 'judge-checks.mjs'), '--label', 'selftest-same-judge', '--dry', runDir], { encoding: 'utf8', env: { ...safe, EVAL_SECOND_JUDGE_MODEL: JUDGE_MODEL } });
  const pl = spawnSync('node', [path.join(EVALS_ROOT, 'cli.mjs'), 'pipeline', '--role', 'navigator', '--execute'], { encoding: 'utf8', env: { ...safe, EVAL_MODEL: JUDGE_MODEL } });
  rmSync(path.join(EVALS_ROOT, 'judge-checks', 'selftest-same-judge'), { recursive: true, force: true });
  check('judge guards: judge-run refuses a run of the judge\'s own model, judge checks refuse a second judge that is the judge, and pipeline refuses before running',
    jr.status === 1 && /is the model under test/.test(jr.stderr) && jc.status !== 0 && /is the judge itself/.test(jc.stderr) && pl.status === 1 && /also the judge/.test(pl.stderr),
    `${jr.stderr.slice(-150)} | ${jc.stderr.slice(-150)} | ${pl.stderr.slice(-150)}`);
}

// 11. The API key: read from the root .env (EVAL_ENV_FILE here) or the shell,
// problems reported without revealing it, and docker gets `-e
// ANTHROPIC_API_KEY` (the value travels in the docker client's environment),
// never the key on its command line. config.mjs reads .env once at import, so
// each case runs in a fresh process.
{
  const envFile = path.join(TMP, 'dot.env');
  writeFileSync(envFile, '# comment\nANTHROPIC_API_KEY="sk-test-FAKE-NOT-A-KEY"\nEVAL_CONCURRENCY=2\nEVAL_ALLOW_MODEL=1\n'); // pragma: allowlist secret
  chmodSync(envFile, 0o644);
  const probe = (env) => JSON.parse(execFileSync('node', ['--input-type=module', '-e',
    `const c = await import(${JSON.stringify(path.join(HERE, 'lib/config.mjs'))}); let key = null; try { key = c.readApiKey(); } catch {}
     console.log(JSON.stringify({ source: c.apiKeySource(), problems: c.apiKeyProblems(), warnings: c.envFileWarnings(), key, conc: process.env.EVAL_CONCURRENCY ?? null, allow: process.env.EVAL_ALLOW_MODEL ?? null }));`],
  { encoding: 'utf8', env: { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'ANTHROPIC_API_KEY' && !k.startsWith('EVAL_'))), ...env } }));
  const fromFile = probe({ EVAL_ENV_FILE: envFile });
  const conflict = probe({ EVAL_ENV_FILE: envFile, ANTHROPIC_API_KEY: 'sk-test-OTHER' });
  const missing = probe({ EVAL_ENV_FILE: path.join(TMP, 'nope.env') });
  const id = 'selftest-key';
  let cmd;
  try {
    execFileSync('node', [path.join(HERE, 'run.mjs'), '--cases', 'navigator-3', '--run-id', id, '--allow-draft'], { stdio: 'pipe', env: { ...process.env, EVAL_ENV_FILE: envFile, EVAL_FIXTURES_DIR: SAMPLES_ROOT } });
    cmd = JSON.parse(readFileSync(path.join(EVALS_ROOT, 'runs', id, 'cases/navigator-3/r1/run.json'), 'utf8')).docker.join(' ');
  } finally {
    rmSync(path.join(EVALS_ROOT, 'runs', id), { recursive: true, force: true });
    try { execFileSync('rmdir', [path.join(EVALS_ROOT, 'runs')], { stdio: 'ignore' }); } catch { /* not empty or absent */ }
  }
  check('API key: read from .env (quotes stripped), EVAL_* settings loaded but never EVAL_ALLOW_MODEL, loose .env permissions warned',
    fromFile.source === '.env' && fromFile.key === 'sk-test-FAKE-NOT-A-KEY' && !fromFile.problems.length && fromFile.conc === '2' && fromFile.allow === null && fromFile.warnings.some((w) => /chmod 600/.test(w)), JSON.stringify(fromFile.problems));
  check('API key: a different key in the shell is refused; a missing key is reported',
    conflict.key === null && conflict.problems.some((p) => /different values/.test(p)) && missing.key === null && missing.problems.some((p) => /not set/.test(p)));
  check('API key: docker gets -e ANTHROPIC_API_KEY, never the key on its command line',
    cmd.includes('-e ANTHROPIC_API_KEY') && !cmd.includes('sk-test-FAKE') && !cmd.includes('--env-file'), cmd.slice(0, 200));
}

// 11b. Review fixes: each guards a failure a reviewer found.
{
  const { predicateOf } = await import('./grade.mjs');
  const { specProblems } = await import('./lib/spec.mjs');
  const { selfCheckOutcome } = await import('./lib/selfcheck.mjs');
  const { specDirHash } = await import('./build-fixture.mjs');
  const { mergeJudge, evidenceParts } = await import('./judge.mjs');
  const { findCase } = await import('./lib/cases.mjs');
  check('predicates: {state, unchanged: true} is a state check; {unchanged: [...]} a file check; two predicates are ambiguous',
    predicateOf({ state: 'WorkflowState', unchanged: true }) === 'state' && predicateOf({ unchanged: ['src/**'] }) === 'unchanged' && predicateOf({ exists: 'a', absent: 'b' }) === null);
  const dev = JSON.parse(readFileSync(path.join(fixture('developer', 1), 'spec.json'), 'utf8'));
  const kase = findCase('developer-1');
  const probs = (patch) => specProblems({ ...dev, ...patch }, { kase, specDir: fixture('developer', 1) });
  const withState = { checks: dev.checks.map((c) => (c.assertion === 5 ? { ...c, all: [...c.all, { state: 'WorkflowState', unchanged: true }] } : c)) };
  check('spec validator: accepts a state "unchanged" check; rejects layer dir "." or outside layers/, a stub outside runtime/, a sentinel under .git, an outside dir under /work, an expected failure without expectOutput, and a model-invented N/A',
    probs(withState).length === 0
    && probs({ layers: [{ dir: '.', action: 'commit', message: 'x' }] }).some((p) => /dir must be layers/.test(p))
    && probs({ layers: [{ dir: 'layers/../gen', action: 'commit', message: 'x' }] }).some((p) => /dir must be layers/.test(p))
    && probs({ runtime: { standardsCli: { mode: 'stub', script: 'runtime/../spec.json' } } }).some((p) => /runtime\/<name>/.test(p))
    && probs({ runtime: { sentinels: [{ marker: '.git/helper.log' }] } }).some((p) => /under \.git or a cache/.test(p))
    && probs({ runtime: { outsideDirs: ['/work/outside'] } }).some((p) => /outside \/work/.test(p))
    && probs({ selfChecks: [{ cmd: 'x', expect: 'fail' }] }).some((p) => /expectOutput/.test(p))
    && probs({ checks: dev.checks.map((c) => (c.assertion === 1 ? { assertion: 1, na: true, na_reason: 'hard' } : c)) }).some((p) => /only the listed N\/A assertions/.test(p))
    && probs({ checks: dev.checks.map((c) => (c.assertion === 1 ? { assertion: 1, na: true, na_reason: 'owner decision: yes' } : c)) }).length === 0);
  // The builder never writes through a symlink an earlier layer made.
  const sl = path.join(TMP, 'symlink-spec');
  cpSync(fixture('navigator', 3), sl, { recursive: true });
  mkdirSync(path.join(sl, 'layers/10-link'), { recursive: true });
  execFileSync('ln', ['-s', path.join(TMP, 'host-target'), path.join(sl, 'layers/10-link/docs')]);
  mkdirSync(path.join(sl, 'layers/20-through/docs'), { recursive: true });
  writeFileSync(path.join(sl, 'layers/20-through/docs/pwned.md'), 'x');
  mkdirSync(path.join(TMP, 'host-target'));
  editSpecFile(sl, 'spec.json', (t) => { const j = JSON.parse(t); j.layers.push({ dir: 'layers/10-link', action: 'commit', message: 'Add docs link' }, { dir: 'layers/20-through', action: 'commit', message: 'Docs' }); return JSON.stringify(j); });
  let thrown = '';
  try { buildFixture({ specDir: sl, out: path.join(TMP, 'symlink-out') }); } catch (e) { thrown = e.message; }
  check('builder: a layer that would write through an earlier layer\'s symlink is refused', /through the symlink docs/.test(thrown) && !existsSync(path.join(TMP, 'host-target/pwned.md')), thrown);
  // The base freeze covers vars and the parent base, not only layers.
  const bh = path.join(TMP, 'base-hash');
  cpSync(fixture('navigator', 3), bh, { recursive: true });
  const h0 = specDirHash(bh);
  editSpecFile(bh, 'spec.json', (t) => JSON.stringify({ ...JSON.parse(t), vars: { ID: 'x' } }));
  const h1 = specDirHash(bh);
  editSpecFile(bh, 'spec.json', (t) => JSON.stringify({ ...JSON.parse(t), base: 'other' }));
  const h2 = specDirHash(bh);
  editSpecFile(bh, 'spec.json', (t) => JSON.stringify({ ...JSON.parse(t), status: 'reviewed', reviewedBy: { at: 'now' } }));
  check('base hash: changes with vars and the parent base, not with review status', h0 !== h1 && h1 !== h2 && specDirHash(bh) === h2);
  check('selfCheck outcomes: a harness failure (95-97, 124, 125) never counts as the expected failure; an expected failure must match expectOutput',
    !selfCheckOutcome({ expect: 'fail', expectOutput: '.' }, 125, 'Unable to find image').ok && !selfCheckOutcome({ expect: 'fail', expectOutput: '.' }, 97, 'x').ok
    && !selfCheckOutcome({ expect: 'fail', expectOutput: 'ECONNREFUSED' }, 1, 'npm ERR! missing script').ok && selfCheckOutcome({ expect: 'fail', expectOutput: 'ECONNREFUSED' }, 1, 'connect ECONNREFUSED 127.0.0.1:5432').ok
    && selfCheckOutcome({ expect: 'pass' }, 0, '').ok && !selfCheckOutcome({ expect: 'pass' }, 1, '').ok);
  // mergeJudge never overwrites a deterministic verdict and keeps every call's cost.
  const det = { verdict: 'PASS', grader: 'deterministic' };
  const pend = { verdict: 'NEEDS_JUDGE', grader: 'judge' };
  mergeJudge(det, { verdict: 'FAIL', costUsd: 1 }, {});
  mergeJudge(pend, { verdict: 'ERROR', costUsd: 0.5 }, {});
  pend.verdict = 'NEEDS_JUDGE';
  mergeJudge(pend, { verdict: 'PASS', costUsd: 0.25 }, {});
  check('judge merge: a deterministic verdict stands; a retried grader error\'s cost still counts', det.verdict === 'PASS' && !det.judge && pend.verdict === 'PASS' && pend.judgeCostUsd === 0.75);
  // A history case's judge evidence shows the seeded turns.
  const ev = evidenceParts({ kase: findCase('navigator-51'), spec: { graderOnly: [], prompt: { skill: 'navigator', utterance: 'u' }, history: { turns: [{ role: 'user', text: 'Grill me.' }, { role: 'assistant', text: 'The queue is FIFO.' }] } },
    c: { before: { stateText: 's' }, after: { stateText: 's' }, diff: { added: [], changed: [], removed: [] }, read: () => null, trace: { texts: [], hooks: [], events: [], reply: 'r' } } });
  const { evidenceText } = await import('./judge.mjs');
  check('judge evidence: a history case shows the seeded prior turns', /<prior_conversation[^>]*>\n\[user\]\nGrill me\.\n\n\[assistant\]\nThe queue is FIFO\./.test(evidenceText(ev)));
  // CLAUDE.md and the files it imports with @ reach the judge as loaded at
  // start (nested imports resolve from the importing file; ones in code do not).
  const start = { 'CLAUDE.md': '<!-- standards:start -->\n@AGENTS.md\nSee `@ignored.md`.\n', 'AGENTS.md': 'Use integer cents.\n@docs/rules.md\n', 'docs/rules.md': 'No dependencies.\n@style.md\n', 'docs/style.md': 'ISO dates.\n', 'ignored.md': 'never loaded' };
  const evStart = evidenceText(evidenceParts({ kase: findCase('navigator-51'), spec: { graderOnly: [], prompt: { skill: 'navigator', utterance: 'u' } },
    c: { before: { stateText: 's' }, after: { stateText: 's' }, diff: { added: [], changed: [], removed: [] }, read: () => null, trace: { texts: [], hooks: [], events: [], reply: 'r' } }, readStart: (p) => start[p] ?? null }));
  check('judge evidence: CLAUDE.md and its @ imports are shown as loaded at start; an import inside code is not',
    /<loaded_at_start[^>]*>\n--- CLAUDE\.md\n[\s\S]*--- AGENTS\.md\nUse integer cents\.[\s\S]*--- docs\/rules\.md\nNo dependencies\.[\s\S]*--- docs\/style\.md\nISO dates\./.test(evStart) && !evStart.includes('never loaded'));
  check('judge evidence: without startup files there is no loaded_at_start block', !evidenceText(ev).includes('<loaded_at_start'));
  // summarize handles a run with a seeded history case (it used to crash).
  const sd = path.join(TMP, 'sum-seed');
  cpSync(path.join(os.tmpdir(), 'standards-eval-sim', 'navigator-3-good/run'), path.join(sd, 'cases/navigator-51/r1'), { recursive: true });
  writeFileSync(path.join(sd, 'cases/navigator-51/r1/seeding.json'), JSON.stringify({ ok: true, seededUnchanged: true, matched: 2, of: 2 }));
  const sr = spawnSync('node', [path.join(HERE, 'summarize.mjs'), sd], { encoding: 'utf8' });
  check('summary: a run with a seeded history case is summarized, with the seeding result', sr.status === 0 && /Seeded sessions/.test(sr.stdout), sr.stderr.slice(-300));
  // Before sign-off, apply-judge sends and records nothing.
  const aj = path.join(TMP, 'aj');
  cpSync(path.join(os.tmpdir(), 'standards-eval-sim', 'developer-1-good/run'), aj, { recursive: true });
  const vBefore = readFileSync(path.join(aj, 'verdicts.json'), 'utf8');
  const env = { ...process.env }; delete env.EVAL_ALLOW_MODEL; delete env.EVAL_FAKE_TRANSPORT;
  const ar = spawnSync('node', [path.join(HERE, 'apply-judge.mjs'), aj], { encoding: 'utf8', env });
  check('apply-judge before sign-off: exits 1 and leaves the verdicts unchanged', ar.status === 1 && readFileSync(path.join(aj, 'verdicts.json'), 'utf8') === vBefore, ar.stderr.slice(-200));
}

// 11c. Second review round.
{
  const { extractFacts } = await import('./extract-facts.mjs');
  const { findCase } = await import('./lib/cases.mjs');
  const { specProblems } = await import('./lib/spec.mjs');
  const { statusFromReview } = await import('./review-fixture.mjs');
  const { isPositiveAssertion } = await import('./judge-checks.mjs');
  const f = (k) => extractFacts(findCase(k).prompt);
  check('gate 2 facts: "inactive unless specified" gives way to a stated frame (tester-6); "staged rollout" is not git state (architect-2); plain cases keep their facts (tester-1, navigator-23)',
    f('tester-6').scalars['Recovery.Active'] === undefined && f('tester-1').scalars['Recovery.Active'] === 'false' && f('architect-9').scalars['Recovery.Active'] === 'false'
    && !f('architect-2').git.includes('staged') && !f('developer-22').git.includes('staged') && f('navigator-23').git.includes('staged'));
  // A committed deletion satisfies "deleted".
  const del = copySpec('navigator', 3, 'deleted-committed');
  mkdirSync(path.join(del, 'layers/90-notes'), { recursive: true });
  writeFileSync(path.join(del, 'layers/90-notes/CHANGELOG.md'), '# Changes\n');
  editSpecFile(del, 'spec.json', (t) => { const j = JSON.parse(t); j.layers.push({ action: 'delete', paths: ['README.md'], stage: true }, { dir: 'layers/90-notes', action: 'commit', message: 'Remove readme' }); return JSON.stringify(j); });
  const { checkFacts } = await import('./validate-fixture.mjs');
  const dout = path.join(TMP, 'deleted-out');
  buildFixture({ specDir: del, out: dout, allowStale: true });
  const dres = checkFacts({ prompt: 'A tracked file was deleted.' }, dout, await snapshot(dout));
  check('gate 2: a deletion already committed counts as "deleted"', dres.problems.length === 0, JSON.stringify(dres.problems));
  const dev = JSON.parse(readFileSync(path.join(fixture('developer', 1), 'spec.json'), 'utf8'));
  check('spec validator: a layer dir of layers/.. or layers/. is refused; a base\'s expected-failure selfCheck needs expectOutput',
    specProblems({ ...dev, layers: [{ dir: 'layers/..', action: 'commit', message: 'x' }] }, { kase: findCase('developer-1'), specDir: fixture('developer', 1) }).some((p) => /dir must be layers/.test(p))
    && specProblems({ ...dev, layers: [{ dir: 'layers/.', action: 'commit', message: 'x' }] }, { kase: findCase('developer-1'), specDir: fixture('developer', 1) }).some((p) => /dir must be layers/.test(p))
    && specProblems({ layers: [], expectCheck: { ok: true }, selfChecks: [{ cmd: 'x', expect: 'fail' }] }, { isBase: true }).some((p) => /expectOutput/.test(p)));
  check('review status: a condition the reviewer found missing flags the fixture even with verdict pass',
    statusFromReview({ verdict: 'pass', issues: [], conditions: [{ condition: 'c', where: '-', status: 'missing' }] }) === 'flagged'
    && statusFromReview({ verdict: 'pass', issues: [], conditions: [{ condition: 'c', where: 'f', status: 'realized' }] }) === 'reviewed');
  // Known negatives: conditional wording is out; an assertion whose checks fail on a do-nothing run is in.
  const sim = (n) => JSON.parse(readFileSync(path.join(os.tmpdir(), 'standards-eval-sim', n, 'run/verdicts.json'), 'utf8')).assertions;
  const r2 = sim('reviewer-2-good'); const d1 = sim('developer-1-good');
  check('do-nothing check: an assertion\'s checks are evaluated on the before-state (reviewer-2.3 and developer-1.5 fail there; developer-1.6 passes)',
    r2[3].doNothing === 'fails' && r2[2].doNothing === 'passes' && d1[5].doNothing === 'fails' && d1[6].doNothing === 'passes' && d1[0].doNothing === 'no-checks');
  check('known-negative filter: conditional wording ("Any handoff ...") and "preserves" are out, whatever their checks; positive wording is in',
    !isPositiveAssertion('Any handoff entering Reviewer names the kind') && !isPositiveAssertion('It preserves AC-001') && !isPositiveAssertion('Neither final review nor sign-off readiness is claimed.') && isPositiveAssertion('Explains the CLI with exact source references'));
  // A killed first attempt's unknown spend survives in the summary.
  const ka = path.join(TMP, 'sum-attempt');
  cpSync(path.join(os.tmpdir(), 'standards-eval-sim', 'developer-1-good/run'), path.join(ka, 'cases/developer-1/r1'), { recursive: true });
  writeFileSync(path.join(ka, 'cases/developer-1/r1/usage.json'), JSON.stringify({ costUsd: 1, wallMs: 1 }));
  mkdirSync(path.join(ka, 'cases/developer-1/r1-attempt1'), { recursive: true });
  writeFileSync(path.join(ka, 'cases/developer-1/r1-attempt1/usage.json'), JSON.stringify({ exitCode: 124, costUsd: null, costUnknown: true }));
  spawnSync('node', [path.join(HERE, 'summarize.mjs'), ka], { encoding: 'utf8' });
  const ks = JSON.parse(readFileSync(path.join(ka, 'summary.json'), 'utf8'));
  check('summary: a retried run\'s killed first attempt is counted as unknown spend', ks.roles.developer.costUnknown === 1 && ks.retries === 1, JSON.stringify(ks.roles.developer));
}

// 11d. Third review round.
{
  const { extractFacts } = await import('./extract-facts.mjs');
  const { checkFacts } = await import('./validate-fixture.mjs');
  const { findCase } = await import('./lib/cases.mjs');
  const { specProblems } = await import('./lib/spec.mjs');
  const { validate } = await import('./validate-fixture.mjs');
  const f = (k) => extractFacts(findCase(k).prompt);
  check('gate 2 facts: "staged and working-tree diffs are empty" and "a deleted CLI option" state no git condition (navigator-21, synchronizer-23)',
    !f('navigator-21').git.includes('staged') && !f('synchronizer-23').git.includes('deleted') && f('navigator-24').git.includes('deleted'));
  // A committed move deletes the old path (rename detection off).
  const mv = copySpec('navigator', 3, 'moved-committed');
  mkdirSync(path.join(mv, 'layers/90-moved/docs'), { recursive: true });
  writeFileSync(path.join(mv, 'layers/90-moved/docs/README.md'), readFileSync(path.join(mv, 'layers/00-project/README.md')));
  editSpecFile(mv, 'spec.json', (t) => { const j = JSON.parse(t); j.layers.push({ action: 'delete', paths: ['README.md'], stage: true }, { dir: 'layers/90-moved', action: 'commit', message: 'Move readme into docs' }); return JSON.stringify(j); });
  const mout = path.join(TMP, 'moved-out');
  buildFixture({ specDir: mv, out: mout, allowStale: true });
  const msnap = await snapshot(mout);
  const mres = checkFacts({ prompt: 'The guide links the deleted old path.' }, mout, msnap);
  const exempt = checkFacts({ prompt: 'Changes are staged.' }, mout, msnap, ['git:staged']);
  check('gate 2: a committed move counts as a deletion; an owner-exempted fact is skipped', mres.problems.length === 0 && exempt.problems.length === 0
    && checkFacts({ prompt: 'Changes are staged.' }, mout, msnap).problems.length === 1, JSON.stringify(mres.problems));
  const dev = JSON.parse(readFileSync(path.join(fixture('developer', 1), 'spec.json'), 'utf8'));
  const k1 = findCase('developer-1');
  let crashed = '';
  let nullProbs = [];
  try { nullProbs = specProblems({ ...dev, invariantExemptions: null, invariants: null, selfChecks: null }, { kase: k1, specDir: fixture('developer', 1) }); } catch (e) { crashed = e.message; }
  check('spec validator: null optional fields do not crash it (and missing invariants are reported)', !crashed && nullProbs.some((p) => /head_unchanged/.test(p)), crashed);
  check('spec validator: complete true on an assertion the catalog routes to the judge (developer-1.0, trace) is refused',
    specProblems({ ...dev, checks: dev.checks.map((c) => (c.assertion === 0 ? { assertion: 0, complete: true, all: [{ exists: 'x' }] } : c)) }, { kase: k1, specDir: fixture('developer', 1) }).some((p) => /assertion 0 is judge-graded/.test(p)));
  // An undefined ${VAR} fails gate 1.
  const uv = copySpec('developer', 1, 'undefined-var');
  editSpecFile(uv, 'spec.json', (t) => t.replace('"path": "${DEV}",\n            "name": "Status"', '"path": "${DEV_PLAN}",\n            "name": "Status"'));
  const uvr = await validate(uv);
  check('gate 1: a ${VAR} no var defines is refused', uvr.problems.some((p) => /undefined vars .*\$\{DEV_PLAN\}/.test(p)), JSON.stringify(uvr.problems));
}

// 11e. Fourth review round.
{
  const { extractFacts } = await import('./extract-facts.mjs');
  const { findCase } = await import('./lib/cases.mjs');
  check('gate 2 facts: "No Tester assignment or recovery is active" means recovery is inactive (developer-54)',
    extractFacts(findCase('developer-54').prompt).scalars['Recovery.Active'] === 'false' && extractFacts(findCase('synchronizer-33').prompt).scalars['Recovery.Active'] === 'true');
  const cat = (r, id) => JSON.parse(readFileSync(path.join(EVALS_ROOT, 'catalog', `${r}.json`), 'utf8')).cases.find((c) => c.id === id);
  check('catalog: the starting states check.mjs rejects on purpose are marked (tester-31, -33, -35, reviewer-43), and developer-57 has its recovery frame',
    ['tester-31', 'tester-33', 'tester-35', 'reviewer-43'].every((k) => { const [r, id] = k.split('-'); return cat(r, Number(id)).fixture.deliberately_invalid === true; }) && cat('developer', 57).fixture.recovery === 'one-frame');
  // The preflight: OK, zero data retention, and lost structured outputs, against fake API answers.
  const pf = path.join(TMP, 'preflight');
  mkdirSync(pf, { recursive: true });
  writeFileSync(path.join(pf, 'ok.mjs'), "export default { createMessage: async (p) => ({ model: p.model, stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ verdict: 'PASS', evidence: ['final_reply: I created notes.md.'], rationale: 'x' }) }], usage: { input_tokens: 1, output_tokens: 1 } }) };");
  writeFileSync(path.join(pf, 'zdr.mjs'), "export default { createMessage: async () => { const e = new Error('400'); e.status = 400; e.error = { error: { type: 'invalid_request_error', message: 'not available under zero data retention' } }; throw e; } };");
  writeFileSync(path.join(pf, 'cmek.mjs'), "export default { createMessage: async (p) => ({ model: p.model, stop_reason: 'end_turn', content: [{ type: 'text', text: 'PASS: the agent created it.' }], usage: { input_tokens: 1, output_tokens: 1 } }) };");
  // It prints one outcome per judge model, the judge first.
  const preAll = (f) => { const r = spawnSync('node', [path.join(HERE, 'judge-preflight.mjs')], { encoding: 'utf8', env: { ...process.env, EVAL_FAKE_TRANSPORT: path.join(pf, f), EVAL_SPEND_LOG: path.join(pf, 'spend.jsonl') } }); try { return { status: r.status, outcomes: JSON.parse(r.stdout) }; } catch { return { status: r.status, outcomes: [{ result: r.stderr.slice(-100) }] }; } };
  const pre = (f) => preAll(f).outcomes[0].result;
  check('judge preflight: tells OK, zero data retention, and lost structured outputs apart', pre('ok.mjs') === 'OK' && pre('zdr.mjs') === 'ZDR_BLOCKED' && pre('cmek.mjs') === 'STRUCTURED_OUTPUT_LOST');
  // The second judge is probed too, and a problem with it alone fails the preflight.
  const { JUDGE_MODEL, SECOND_JUDGE_MODEL } = await import('./lib/config.mjs');
  writeFileSync(path.join(pf, 'second-zdr.mjs'), `export default { createMessage: async (p) => { if (p.model === ${JSON.stringify(SECOND_JUDGE_MODEL)}) { const e = new Error('400'); e.status = 400; e.error = { error: { type: 'invalid_request_error', message: 'not available under zero data retention' } }; throw e; } return { model: p.model, stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ verdict: 'PASS', evidence: ['final_reply: I created notes.md.'], rationale: 'x' }) }], usage: { input_tokens: 1, output_tokens: 1 } }; } };`);
  const both = preAll('second-zdr.mjs');
  check('judge preflight: probes the judge and the second judge, and fails when only the second judge is blocked',
    SECOND_JUDGE_MODEL === 'none' ? both.outcomes.length === 1 && both.status === 0
      : both.outcomes.length === 2 && both.outcomes[0].result === 'OK' && both.outcomes[0].model === JUDGE_MODEL && both.outcomes[1].result === 'ZDR_BLOCKED' && both.outcomes[1].model === SECOND_JUDGE_MODEL && both.status === 1,
    JSON.stringify(both));
}

// 11g. Sixth review round.
{
  // Decision 15: at least 10 second-judge pairs per role (all of them when fewer exist).
  const { secondJudgeSample } = await import('./judge-checks.mjs');
  const mk = (n) => Array.from({ length: n }, (_, k) => ({ id: `v${k}`, verdict: k % 3 ? 'PASS' : 'FAIL' }));
  check('second judge: 10% of verdicts but at least 10 pairs, never more than exist; half FAILs where they exist',
    secondJudgeSample(mk(40), 'x', 0.1).length === 10 && secondJudgeSample(mk(200), 'x', 0.1).length === 20 && secondJudgeSample(mk(6), 'x', 0.1).length === 6
    && secondJudgeSample(mk(40), 'x', 0.1).filter((j) => j.verdict === 'FAIL').length === 5);
}
{
  // A run that never reached the role under test with the requested model is an infrastructure error.
  const { runReachedRole } = await import('./lib/trace.mjs');
  const tj = path.join(TMP, 'init.jsonl');
  writeFileSync(tj, [
    JSON.stringify({ type: 'system', subtype: 'init', model: 'claude-sonnet-5-5', permissionMode: 'bypassPermissions', slash_commands: ['tester', 'navigator', 'compact'] }),
    JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'Verifying.' }] } }),
    JSON.stringify({ type: 'result', subtype: 'success', result: 'Verified.', num_turns: 4, total_cost_usd: 0.5 }),
  ].join('\n'));
  const good = parseTranscript(tj, '/work');
  const r = (over, role = 'tester') => runReachedRole({ ...good, ...over }, { role, model: 'claude-sonnet-5-5' });
  check('session check: a run is an infrastructure error unless it started, ran the requested model, could resolve /<role>, and made a model turn',
    good.init?.model === 'claude-sonnet-5-5' && r({}) === null && /never started/.test(r({ init: null })) && /ran claude-opus-5-5/.test(r({ init: { ...good.init, model: 'claude-opus-5-5' } }))
    && /did not load/.test(r({}, 'reviewer')) && /could not resolve/.test(r({ init: { ...good.init, slashCommands: null }, reply: 'Unknown command: /tester' })) && /no model turn/.test(r({ usage: { ...good.usage, turns: 0 } })));
  // "**/" is zero or more directories.
  const { globRe } = await import('./grade.mjs');
  check('globs: "**/" matches zero or more directories ("test/**/*.test.ts" covers test/a.test.ts; "**/*.md" covers README.md); "*" stays one segment',
    globRe('test/**/*.test.ts').test('test/a.test.ts') && globRe('test/**/*.test.ts').test('test/x/y/a.test.ts') && globRe('src/**').test('src/export.ts') && globRe('**/*.md').test('README.md')
    && globRe('**/*.md').test('docs/a/b.md') && !globRe('*.md').test('docs/x.md') && !globRe('src/**/*.ts').test('srcx/a.ts'));
  // A run that hit the time limit is TIMEOUT, not an error and not a failure.
  const to = path.join(TMP, 'timeout-run');
  rmSync(to, { recursive: true, force: true });
  mkdirSync(path.join(to, 'cases/tester-1/r1'), { recursive: true });
  writeFileSync(path.join(to, 'cases/tester-1/r1/usage.json'), JSON.stringify({ exitCode: 124, wallMs: 1200000, costUsd: null, costUnknown: true }));
  spawnSync('node', [path.join(HERE, 'summarize.mjs'), to], { encoding: 'utf8' });
  const ts = JSON.parse(readFileSync(path.join(to, 'summary.json'), 'utf8'));
  check('summary: a run that hit the time limit is counted as a timeout, not an error or a failure', ts.roles.tester.timeouts === 1 && ts.roles.tester.errors === 0 && ts.cases[0].status === 'TIMEOUT', JSON.stringify(ts.roles.tester));
  // ${COMMIT:<subject>} in a check resolves from the run's build; an unknown subject fails gate 1.
  const { substituteRevisions } = await import('./grade.mjs');
  const cs = copySpec('navigator', 3, 'commit-in-check');
  editSpecFile(cs, 'spec.json', (x) => { const j = JSON.parse(x); j.checks[0] = { ...j.checks[0], all: [...(j.checks[0].all ?? []), { reply_matches: '${COMMIT:No such commit}' }] }; return JSON.stringify(j); });
  const cv = await validate(cs, { out: path.join(TMP, 'commit-in-check-out') });
  check('checks: ${COMMIT:<subject>} resolves to the build\'s hash at grading; a subject the build lacks fails gate 1',
    substituteRevisions({ reply_matches: '${COMMIT:Install STANDARDS}' }, { 'Install STANDARDS': 'abc123' }).reply_matches === 'abc123' && cv.problems.some((p) => /names no commit of this build/.test(p))
    && 'Install STANDARDS' in (cv.build?.revisions?.commits ?? {}), JSON.stringify(cv.problems));
}
{
  // The stop-1 report shows agreement between repetitions.
  const fl = path.join(TMP, 'flaky');
  rmSync(fl, { recursive: true, force: true });
  cpSync(path.join(os.tmpdir(), 'standards-eval-sim', 'developer-1-good', 'run'), path.join(fl, 'cases/developer-1/r1'), { recursive: true });
  cpSync(path.join(os.tmpdir(), 'standards-eval-sim', 'developer-1-bad', 'run'), path.join(fl, 'cases/developer-1/r2'), { recursive: true });
  cpSync(path.join(os.tmpdir(), 'standards-eval-sim', 'navigator-3-good', 'run'), path.join(fl, 'cases/navigator-3/r1'), { recursive: true });
  const fr = spawnSync('node', [path.join(HERE, 'summarize.mjs'), '--out', path.join(fl, 'sum'), fl], { encoding: 'utf8' });
  const fs1 = existsSync(path.join(fl, 'sum/summary.json')) ? JSON.parse(readFileSync(path.join(fl, 'sum/summary.json'), 'utf8')).flakiness : null;
  const md1 = existsSync(path.join(fl, 'sum/summary.md')) ? readFileSync(path.join(fl, 'sum/summary.md'), 'utf8') : '';
  check('summary: agreement between repetitions per assertion (only cases with two graded reps; unjudged left out) and cases that change status',
    fs1 && fs1.casesCompared === 1 && fs1.differ.length > 0 && fs1.differ.every((d) => d.key === 'developer-1') && /Agreement between repetitions/.test(md1), `${fr.stderr.slice(-300)} ${JSON.stringify(fs1)}`);
}

// 11f. Fifth review round.
{
  // Grading never imports the project's own record parser (a role could edit it; grading runs on the host).
  const { grade } = await import('./grade.mjs');
  const gr = path.join(TMP, 'grade-pristine');
  rmSync(gr, { recursive: true, force: true });
  cpSync(path.join(os.tmpdir(), 'standards-eval-sim', 'developer-1-good', 'run'), gr, { recursive: true });
  const gmark = path.join(TMP, 'grade-ran-project-code');
  rmSync(gmark, { force: true });
  editSpecFile(gr, 'after/.standards/bin/lib/records.mjs', (x) => `(await import('node:fs')).writeFileSync(${JSON.stringify(gmark)}, 'x');\n${x}`);
  const gres = await grade(gr, fixture('developer', 1));
  check('grading reads records with the pinned framework\'s pristine parser, never the project\'s edited copy', gres.assertions.length > 0 && !existsSync(gmark), gres.error ?? '');
  // A stray staging dir never becomes a target in flags.mjs.
  const fxr = path.join(TMP, 'flags-root');
  for (const d of ['developer/1', 'developer/1.staging', '_bases']) mkdirSync(path.join(fxr, d), { recursive: true });
  for (const d of ['developer/1', 'developer/1.staging']) writeFileSync(path.join(fxr, d, 'spec.json'), '{}');
  const ft = spawnSync('node', ['--input-type=module', '-e', `const { allTargets } = await import(${JSON.stringify(path.join(HERE, 'flags.mjs'))}); console.log(JSON.stringify(allTargets()));`], { encoding: 'utf8', env: { ...process.env, EVAL_FIXTURES_DIR: fxr } });
  check('flags.mjs lists only case dirs, never a leftover <id>.staging', ft.stdout.trim() === '["developer-1"]', `${ft.stdout}${ft.stderr.slice(-200)}`);
}
{
  // A changed path that cannot be read as text (a virtual environment's
  // lib64 -> lib link, a file without read permission) shows as unreadable in
  // the judge evidence instead of failing the whole grade.
  const { grade } = await import('./grade.mjs');
  const { symlinkSync } = await import('node:fs');
  const gl = path.join(TMP, 'grade-dir-link');
  rmSync(gl, { recursive: true, force: true });
  cpSync(path.join(os.tmpdir(), 'standards-eval-sim', 'developer-1-good', 'run'), gl, { recursive: true });
  mkdirSync(path.join(gl, 'after/build/lib'), { recursive: true });
  symlinkSync('lib', path.join(gl, 'after/build/lib64'));
  writeFileSync(path.join(gl, 'after/locked.txt'), 'x');
  chmodSync(path.join(gl, 'after/locked.txt'), 0o000);
  editSpecFile(gl, 'after.json', (x) => { const j = JSON.parse(x); j.files['build/lib64'] = 'link'; j.files['locked.txt'] = 'locked'; return JSON.stringify(j); });
  let gerr = '';
  try { await grade(gl, fixture('developer', 1), { judge: 'dry' }); } catch (e) { gerr = e.message; }
  chmodSync(path.join(gl, 'after/locked.txt'), 0o644);
  const gev = existsSync(path.join(gl, 'judge-evidence.json')) ? JSON.parse(readFileSync(path.join(gl, 'judge-evidence.json'), 'utf8')).changedFiles : '';
  check('grading: a changed link to a directory or an unreadable file does not fail the grade; the judge evidence shows each as unreadable',
    !gerr && gev.includes('--- build/lib64 (added)\n(binary or unreadable)') && gev.includes('--- locked.txt (added)\n(binary or unreadable)'), gerr);
}
{
  // Records cite real revisions: ${COMMIT:<subject>} and ${BLOB:<path>} become the built repo's hashes; an unknown subject fails gate 1.
  const rv = copySpec('navigator', 3, 'revisions');
  mkdirSync(path.join(rv, 'layers/91-code'), { recursive: true });
  writeFileSync(path.join(rv, 'layers/91-code/lib.txt'), 'code v1\n');
  mkdirSync(path.join(rv, 'layers/92-rec'), { recursive: true });
  writeFileSync(path.join(rv, 'layers/92-rec/assessed.md'), 'Assessed commit: ${COMMIT:Add lib} blob ${BLOB:lib.txt}\n');
  editSpecFile(rv, 'spec.json', (x) => { const j = JSON.parse(x); j.layers.push({ dir: 'layers/91-code', action: 'commit', message: 'Add lib' }, { dir: 'layers/92-rec', action: 'commit', message: 'Record' }); return JSON.stringify(j); });
  const rvo = path.join(TMP, 'revisions-out');
  const rb = buildFixture({ specDir: rv, out: rvo, allowStale: true });
  const sha = execFileSync('git', ['log', '--format=%H', '--grep=^Add lib$'], { cwd: rvo, encoding: 'utf8' }).trim();
  const blob = execFileSync('git', ['rev-parse', 'HEAD:lib.txt'], { cwd: rvo, encoding: 'utf8' }).trim();
  const recText = readFileSync(path.join(rvo, 'assessed.md'), 'utf8');
  editSpecFile(rv, 'layers/92-rec/assessed.md', () => 'Assessed: ${COMMIT:No such commit}\n');
  const rb2 = buildFixture({ specDir: rv, out: path.join(TMP, 'revisions-out2'), allowStale: true });
  check('builder: ${COMMIT:<subject>} and ${BLOB:<path>} in a record become the built repo\'s real hashes; an unknown subject is a gate problem',
    rb.problems.length === 0 && sha.length === 40 && recText === `Assessed commit: ${sha} blob ${blob}\n` && rb2.problems.some((p) => /no earlier commit has that subject/.test(p)), `${JSON.stringify(rb.problems)} ${recText}`);
}
{
  // Sync judging sends one call per cached prefix (run) first; the rest start only after it returns.
  const jd = path.join(TMP, 'judge-order');
  mkdirSync(jd, { recursive: true });
  const evlog = path.join(jd, 'events.jsonl');
  writeFileSync(path.join(jd, 'fake.mjs'), `import { appendFileSync } from 'node:fs';
export default { createMessage: async (p) => { const k = p.messages[0].content[0].text; appendFileSync(${JSON.stringify(evlog)}, JSON.stringify({ k, ev: 'start', t: performance.timeOrigin + performance.now() }) + '\\n');
  await new Promise((r) => setTimeout(r, 30)); appendFileSync(${JSON.stringify(evlog)}, JSON.stringify({ k, ev: 'end', t: performance.timeOrigin + performance.now() }) + '\\n');
  return { model: p.model, stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ verdict: 'PASS', evidence: ['x'], rationale: 'x' }) }], usage: { input_tokens: 1, output_tokens: 1 } }; } };`);
  writeFileSync(path.join(jd, 'send.mjs'), `import { sendAll } from ${JSON.stringify(path.join(HERE, 'judge-run.mjs'))};
const req = (run, n) => ({ model: 'claude-fable-5-1', system: 's', max_tokens: 10, messages: [{ role: 'user', content: [{ type: 'text', text: run, cache_control: { type: 'ephemeral' } }, { type: 'text', text: 'a' + n }] }] });
const items = []; for (const run of ['A', 'B', 'C']) for (let n = 0; n < 3; n += 1) items.push({ customId: run + n, request: req(run, n) });
const r = await sendAll(items, { mode: 'sync', concurrency: 4 }); console.log(JSON.stringify({ n: r.size }));`);
  const sr = spawnSync('node', [path.join(jd, 'send.mjs')], { encoding: 'utf8', env: { ...process.env, EVAL_FAKE_TRANSPORT: path.join(jd, 'fake.mjs'), EVAL_SPEND_LOG: path.join(jd, 'spend.jsonl') } });
  const evs = existsSync(evlog) ? readFileSync(evlog, 'utf8').trim().split('\n').map((l) => JSON.parse(l)) : [];
  const warmFirst = ['A', 'B', 'C'].every((k) => { const mine = evs.filter((e) => e.k === k); const firstEnd = mine.find((e) => e.ev === 'end')?.t; return mine.filter((e) => e.ev === 'start').length === 3 && mine.filter((e) => e.ev === 'start').slice(1).every((e) => e.t >= firstEnd); });
  check('judge-run sync: one call per cached prefix first, the rest after it returns (the cache is warm), all sent', sr.status === 0 && /"n":9/.test(sr.stdout) && warmFirst, `${sr.stdout}${sr.stderr.slice(-300)}`.replace(/\n/g, ' '));
}
{
  // The API key a role printed is redacted from every saved file; one in git history is detected.
  const { redactKey, gitHolds, REDACTED } = await import('./lib/credentials.mjs');
  const fakeKey = 'sk-ant-test-0000000000000000000000';
  const rk = path.join(TMP, 'redact');
  mkdirSync(path.join(rk, 'proj/.git'), { recursive: true });
  writeFileSync(path.join(rk, 'transcript.jsonl'), `{"type":"tool_result","content":"ANTHROPIC_API_KEY=${fakeKey}\\nHOME=/home/runner"}\n`);
  writeFileSync(path.join(rk, 'proj/debug.log'), `key ${fakeKey} end`);
  writeFileSync(path.join(rk, 'proj/clean.txt'), 'nothing here');
  const changed = redactKey([rk], { key: fakeKey, skip: ['.git'] });
  const g = path.join(rk, 'repo');
  mkdirSync(g); execFileSync('git', ['init', '-q'], { cwd: g }); writeFileSync(path.join(g, 'env.txt'), fakeKey);
  execFileSync('git', ['-c', 'user.name=x', '-c', 'user.email=x@x', 'add', '.'], { cwd: g }); execFileSync('git', ['-c', 'user.name=x', '-c', 'user.email=x@x', 'commit', '-qm', 'x'], { cwd: g });
  writeFileSync(path.join(g, 'env.txt'), 'gone');
  const run = (repo, args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  check('API key in run output: redacted from every saved file (transcript, project files), clean files untouched; a key only in git history is detected',
    changed.length === 2 && !readFileSync(path.join(rk, 'transcript.jsonl'), 'utf8').includes(fakeKey) && readFileSync(path.join(rk, 'proj/debug.log'), 'utf8') === `key ${REDACTED} end`
    && readFileSync(path.join(rk, 'proj/clean.txt'), 'utf8') === 'nothing here' && gitHolds(g, run, { key: fakeKey }) && !gitHolds(path.join(rk, 'proj'), run, { key: fakeKey }));
}
{
  const { isPositiveAssertion, evaluateChecks, exitCodeOf } = await import('./judge-checks.mjs');
  // The preflight on the documented ZDR message, a CMEK rejection of the format, and a spend-limit 429.
  const pf = path.join(TMP, 'preflight5');
  mkdirSync(pf, { recursive: true });
  const thrower = (status, message) => `export default { createMessage: async () => { const e = new Error(String(${status})); e.status = ${status}; e.error = { error: { type: 'x', message: ${JSON.stringify(message)} } }; throw e; } };`;
  writeFileSync(path.join(pf, 'zdr.mjs'), thrower(400, 'In order to access this model, your organization or workspace must have data retention enabled.'));
  writeFileSync(path.join(pf, 'cmek.mjs'), thrower(400, 'output_config.format: structured outputs are not available for this model in your organization'));
  writeFileSync(path.join(pf, 'limit.mjs'), thrower(429, 'You have reached your specified API usage limits. You will regain access on 2026-10-01.'));
  const pre = (f) => { const r = spawnSync('node', [path.join(HERE, 'judge-preflight.mjs')], { encoding: 'utf8', env: { ...process.env, EVAL_FAKE_TRANSPORT: path.join(pf, f), EVAL_SPEND_LOG: path.join(pf, 'spend.jsonl') } }); try { return JSON.parse(r.stdout)[0].result; } catch { return r.stderr.slice(-100); } };
  writeFileSync(path.join(pf, 'rate.mjs'), thrower(429, 'Number of request tokens has exceeded your per-minute rate limit'));
  check('judge preflight: the documented ZDR 400 is ZDR, a 400 rejecting the format is lost structured outputs, a spend-limit 429 is SPEND_LIMIT, a plain rate limit is neither',
    pre('zdr.mjs') === 'ZDR_BLOCKED' && pre('cmek.mjs') === 'STRUCTURED_OUTPUT_LOST' && pre('limit.mjs') === 'SPEND_LIMIT' && pre('rate.mjs') === 'OTHER_ERROR');
  check('known-negative filter: a passive "recorded only when" restriction is out (auditor-1.4); an active "marks DONE only after" is in (developer-49.0)',
    !isPositiveAssertion('Established commands are recorded only when supported by project configuration, documentation, scripts, or safe verification')
    && isPositiveAssertion('It records the actual self-check execution and marks DEV-001 DONE only after its expected outcome is satisfied.'));
  // Grader errors leave a check incomplete (exit 3): never a met target on a shrunk sample, never a judge miss.
  const rows = (n, err, was = 'PASS') => Array.from({ length: n }, (_, k) => ({ id: `x${k}`, was, got: k < err ? 'ERROR' : was }));
  const neg = (got) => [{ source: 'a', kind: 'empty', weak: false, got }, { source: 'b', kind: 'other-role', weak: false, got: 'FAIL' }];
  const shrunk = evaluateChecks({ negatives: neg('FAIL'), stability: rows(10, 9), second: rows(7, 6, 'FAIL') });
  const negErr = evaluateChecks({ negatives: neg('ERROR'), stability: rows(10, 0), second: rows(7, 0) });
  const negUnclear = evaluateChecks({ negatives: neg('UNCLEAR'), stability: rows(10, 1), second: rows(7, 0) });
  check('judge checks: grader errors leave a check incomplete (exit 3), never met on a shrunk sample and never a miss; a graded UNCLEAR negative is a miss (exit 2)',
    shrunk.stability.meetsTarget === null && shrunk.secondJudge.meetsTarget === null && exitCodeOf(shrunk) === 3
    && negErr.knownNegatives.meetsTarget === null && negErr.knownNegatives.misses.length === 0 && exitCodeOf(negErr) === 3
    && negUnclear.knownNegatives.meetsTarget === false && exitCodeOf(negUnclear) === 2
    && exitCodeOf(evaluateChecks({ negatives: neg('FAIL'), stability: rows(10, 0), second: rows(7, 0) })) === 0);
}

// 12. Everything step 0 added (generator, review, decisions, bases, runtime
// block, session seeding, judge runs in sync and batch mode, judge checks,
// cost accounting), end to end with a fake Claude API: selftest/pipeline.mjs
// in a child process with a scratch fixtures root.
// Gate 2 reads records under .standards/docs; a dangling symlink there (a case
// that points a records folder outside the project, created only at run time)
// once hid every record, so stated AC identifiers looked undefined.
{
  const { recordsText } = await import('./validate-fixture.mjs');
  const { symlinkSync } = await import('node:fs');
  const root = path.join(TMP, 'dangling-docs');
  rmSync(root, { recursive: true, force: true });
  mkdirSync(path.join(root, '.standards/docs/scope'), { recursive: true });
  writeFileSync(path.join(root, '.standards/docs/scope/x.md'), '- `AC-001`: something\n');
  symlinkSync('../../../missing-outside', path.join(root, '.standards/docs/documentation'));
  check('gate 2: a dangling symlink under .standards/docs does not hide the other records', /AC-001/.test(recordsText(root, {})));
}

// Mid-run edits (runtime.midRunEdits): the in-container PostToolUse hook copies
// the replacement once, on the first matching tool call; gate 1 validates the
// block; prepareRuntime wires --settings; grading treats the replaced file as
// the role's starting point, so a "changes nothing" check never blames the role.
{
  const { handle, matches } = await import('./container/midrun.mjs');
  const { prepareRuntime, runtimeProblems } = await import('./lib/runtime.mjs');
  const { midRunBaseline } = await import('./grade.mjs');
  const { createHash } = await import('node:crypto');
  const root = path.join(TMP, 'midrun');
  rmSync(root, { recursive: true, force: true });
  const proj = path.join(root, 'work'); const spec = path.join(root, 'spec');
  mkdirSync(path.join(proj, 'src'), { recursive: true }); mkdirSync(path.join(spec, 'runtime'), { recursive: true });
  writeFileSync(path.join(proj, 'src/caller.js'), 'old caller\n'); writeFileSync(path.join(proj, 'src/callee.js'), 'callee\n');
  writeFileSync(path.join(spec, 'runtime/caller-v2.js'), 'new caller\n');
  const rt = { midRunEdits: [{ after: { tool: 'Read', path: 'src/callee.js' }, files: { 'src/caller.js': 'runtime/caller-v2.js' } }] };
  check('midRunEdits: a well-formed block passes gate 1', runtimeProblems(rt, spec).length === 0, runtimeProblems(rt, spec).join('; '));
  const bad = runtimeProblems({ midRunEdits: [{ after: { tool: 'Read' }, files: { '../x': '/etc/passwd' } }] }, spec);
  check('midRunEdits: no trigger point, a target outside the project, and a source outside runtime/ are gate-1 problems',
    bad.some((p) => /needs a path or a command/.test(p)) && bad.some((p) => /target must be/.test(p)) && bad.some((p) => /source must be/.test(p)), bad.join('; '));
  const evalDir = path.join(root, 'eval');
  const prep = prepareRuntime({ runtime: rt, specDir: spec, evalDir, projectRoot: proj, framework: null });
  const settings = JSON.parse(readFileSync(path.join(evalDir, 'settings.json'), 'utf8'));
  check('midRunEdits: prepareRuntime adds --settings with a PostToolUse hook from /opt/eval',
    prep.claudeArgs.join(' ') === '--settings /opt/eval/settings.json' && settings.hooks.PostToolUse[0].hooks[0].command === 'node /opt/eval/midrun.mjs');
  // The hook, run against the prepared config with the source paths pointed at the eval dir.
  const cfgFile = path.join(evalDir, 'midrun.json');
  const cfgJson = JSON.parse(readFileSync(cfgFile, 'utf8'));
  cfgJson.edits[0].files[0].source = cfgJson.edits[0].files[0].source.replace('/opt/eval', evalDir);
  writeFileSync(cfgFile, JSON.stringify(cfgJson));
  const log = path.join(root, 'claude/projects/eval-midrun.json');
  const ev = (tool, file) => ({ tool_name: tool, tool_input: { file_path: path.join(proj, file) }, cwd: proj });
  const none = handle(ev('Read', 'src/caller.js'), { config: cfgFile, log });
  const first = handle(ev('Read', 'src/callee.js'), { config: cfgFile, log });
  writeFileSync(path.join(proj, 'src/caller.js'), 'role edit\n');
  const again = handle(ev('Read', 'src/callee.js'), { config: cfgFile, log });
  check('midRunEdits: the hook fires only on the matching call, copies the replacement, and fires once',
    none.length === 0 && first.length === 1 && again.length === 0 && readFileSync(path.join(proj, 'src/caller.js'), 'utf8') === 'role edit\n'
      && !matches({ tool: 'Read', path: 'src/*.js' }, { tool_name: 'Edit', tool_input: { file_path: path.join(proj, 'src/a.js') } }, proj));
  const runDir = path.join(root, 'run'); mkdirSync(path.join(runDir, 'session'), { recursive: true });
  cpSync(log, path.join(runDir, 'session/eval-midrun.json'));
  writeFileSync(path.join(spec, 'spec.json'), JSON.stringify({ runtime: rt, layers: [] }));
  const base = midRunBaseline(runDir, spec);
  check('midRunEdits: grading takes the harness replacement as the starting point of the replaced file',
    base['src/caller.js'] === createHash('sha256').update('new caller\n').digest('hex').slice(0, 16), JSON.stringify(base));
}

// noGit: setup hides .git from the role and restores the original after the
// run, recording (and discarding) a .git the role created.
{
  const root = path.join(TMP, 'nogit'); rmSync(root, { recursive: true, force: true });
  const proj = path.join(root, 'proj'); const rtDir = path.join(root, 'rt'); const tmp = path.join(root, 'tmp');
  mkdirSync(proj, { recursive: true }); mkdirSync(rtDir, { recursive: true }); mkdirSync(tmp, { recursive: true });
  execFileSync('git', ['init', '-q', proj]); writeFileSync(path.join(proj, '.git/marker'), 'original');
  writeFileSync(path.join(rtDir, 'runtime.json'), JSON.stringify({ projectRoot: proj, noGit: true }));
  const env = { ...process.env, EVAL_RUNTIME_DIR: rtDir, EVAL_TMP: tmp, EVAL_NOGIT_LOG: path.join(root, 'log.json') };
  execFileSync('node', [path.join(HERE, 'container/setup.mjs'), 'before'], { env });
  const hidden = !existsSync(path.join(proj, '.git'));
  execFileSync('git', ['init', '-q', proj]);
  execFileSync('node', [path.join(HERE, 'container/setup.mjs'), 'after'], { env });
  const log = JSON.parse(readFileSync(path.join(root, 'log.json'), 'utf8'));
  check('noGit: the role sees no .git; the original comes back after, and a .git the role created is recorded and discarded',
    hidden && readFileSync(path.join(proj, '.git/marker'), 'utf8') === 'original' && log.roleCreatedGit === true, JSON.stringify(log));
}

// runtime.image: only "browser" is allowed, and it selects the browser image.
{
  const { imageFor, runtimeProblems } = await import('./lib/runtime.mjs');
  const { BROWSER_IMAGE, IMAGE } = await import('./lib/config.mjs');
  check('runtime.image: "browser" selects the browser image; another value is a gate-1 problem; absent keeps the default',
    imageFor({ image: 'browser' }) === BROWSER_IMAGE && imageFor({}) === IMAGE && BROWSER_IMAGE !== IMAGE
      && runtimeProblems({ image: 'gpu' }).some((p) => /runtime.image/.test(p)) && runtimeProblems({ image: 'browser' }).length === 0);
}

// SelfCheck commands get the spec's ${VAR}s, like checks (tester-25 once failed
// gate 1 because `grep ... ${DEV}` ran with an empty shell variable).
{
  const { selfCheckCommands } = await import('./validate-fixture.mjs');
  const [c] = selfCheckCommands([{ cmd: 'grep -q x ${DEV} && echo ${HOME_DIR}', expect: 'pass' }], { DEV: 'docs/dev.md' });
  check('selfChecks: ${VAR} is filled from the spec vars; an unknown one is left as written', c.cmd === 'grep -q x docs/dev.md && echo ${HOME_DIR}', c.cmd);
}

{
  const scratch = path.join(TMP, 'pipeline');
  const r = spawnSync('node', [path.join(HERE, 'selftest/pipeline.mjs')], {
    encoding: 'utf8', maxBuffer: 1 << 26,
    env: { ...process.env, EVAL_FIXTURES_DIR: path.join(scratch, 'fixtures'), EVAL_FAKE_TRANSPORT: path.join(HERE, 'selftest/fake-transport.mjs'),
      EVAL_FAKE_DIR: path.join(scratch, 'fake'), EVAL_SPEND_LOG: path.join(scratch, 'spend.jsonl'), EVAL_ALLOW_MODEL: '' },
  });
  let out = null;
  try { out = JSON.parse(r.stdout.trim().split('\n').at(-1)); } catch { /* reported below */ }
  if (!out) check('pipeline self-test ran', false, `${r.stderr.slice(-800)}`);
  for (const c of out?.checks ?? []) check(c.name, c.ok, c.ok ? '' : c.detail);
}

// Migration of earlier fixtures (lib/migrate.mjs): the CompletionPolicy each
// cycle shape gets, files it leaves alone, and how a changed case is classified.
{
  const { addCompletionPolicy, caseChange } = await import('./lib/migrate.mjs');
  const { findCase, hashOf } = await import('./lib/cases.mjs');
  const st = (head, active) => `# Workflow State\n\n${head}\n\n## Active Work\n\n${active}\n\n## Handoff\n\n\`Kind\`: \`NONE\`\n`;
  const policy = (head, active) => addCompletionPolicy(st(head, active)).value ?? null;
  const standard = policy('`WorkflowState`: `DEVELOPING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`', '`Id`: `x-20260924T090000Z-a7f3c1d2` `Scope`: `s.md`');
  const expedited = policy('`WorkflowState`: `DEVELOPING` `CycleMode`: `EXPEDITED` `PendingCycleMode`: `STANDARD`', '`Id`: `x-20260924T090000Z-a7f3c1d2` `Scope`: `NONE`');
  const idle = policy('`WorkflowState`: `SIGNED_OFF` `CycleMode`: `UNSET` `PendingCycleMode`: `UNSET`', '`Id`: `UNSET` `Scope`: `NONE`');
  const doneStandard = policy('`WorkflowState`: `SIGNED_OFF` `CycleMode`: `UNSET`', '`Id`: `x-20260924T090000Z-a7f3c1d2` `Scope`: `s.md` `Architecture`: `d.md`');
  const doneExpedited = policy('`WorkflowState`: `SIGNED_OFF` `CycleMode`: `UNSET`', '`Id`: `x-20260924T090000Z-a7f3c1d2` `Scope`: `NONE` `Architecture`: `NONE`');
  const inserted = addCompletionPolicy(st('`CycleMode`: `STANDARD`', '`Id`: `x-1` `Request`: `r`')).text;
  const again = addCompletionPolicy(inserted);
  const broken = addCompletionPolicy('# Workflow State\n\nno sections here\n');
  check('migration: CompletionPolicy is FULL_DELIVERABLE for standard cycles (finished ones too) and NONE for expedited, idle, or finished expedited ones',
    standard === 'FULL_DELIVERABLE' && expedited === 'NONE' && idle === 'NONE' && doneStandard === 'FULL_DELIVERABLE' && doneExpedited === 'NONE',
    JSON.stringify({ standard, expedited, idle, doneStandard, doneExpedited }));
  // The 0.15.0 template's own layout (the field and Id on one line) is current, not something to repair.
  const native = '## Active Work\n\n`CompletionPolicy`: `NONE` `Id`: `UNSET` `Request`: `UNSET`\n';
  check('migration: the field goes first in Active Work, on its own line before Id; a second pass, the 0.15.0 template\'s own line, and a STATE.md without Active Work are left alone',
    /## Active Work\n\n`CompletionPolicy`: `FULL_DELIVERABLE`\n`Id`: `x-1`/.test(inserted) && again.text === inserted && again.skipped
      && addCompletionPolicy(native).text === native && broken.skipped === 'no Active Work section');
  // A finished cycle keeps its policy (PROTOCOL.md: sign-off and retained cancellation preserve it).
  const finished = (from, active, known) => addCompletionPolicy(`# Workflow State\n\n\`WorkflowState\`: \`IDLE\` \`CycleMode\`: \`UNSET\`\n\n## Active Work\n\n${active}\n\n## Handoff\n\n\`From\`: \`${from}\`\n`, known).value ?? null;
  const noRecords = '`Id`: `x-1` `Scope`: `NONE` `Architecture`: `NONE` `PromotionReason`: `NONE`';
  const cancelledStandard = finished('SCOPING', noRecords);
  const promoted = finished('DEVELOPING', noRecords.replace('`PromotionReason`: `NONE`', '`PromotionReason`: `scope grew`'));
  const cancelledExpedited = finished('DEVELOPING', noRecords);
  const fromEarlier = finished('DEVELOPING', noRecords, new Map([['x-1', 'FULL_DELIVERABLE']]));
  check('migration: a finished cycle that left a standard-only state or was promoted keeps FULL_DELIVERABLE, as does one an earlier state shows; a finished expedited one gets NONE',
    cancelledStandard === 'FULL_DELIVERABLE' && promoted === 'FULL_DELIVERABLE' && cancelledExpedited === 'NONE' && fromEarlier === 'FULL_DELIVERABLE',
    JSON.stringify({ cancelledStandard, promoted, cancelledExpedited, fromEarlier }));
  // Across layers: a later state of the same cycle keeps the policy an earlier layer shows.
  {
    const { migrateStateFiles } = await import('./lib/migrate.mjs');
    const d = path.join(TMP, 'state-layers');
    const stateAt = (layer, head, from) => {
      mkdirSync(path.join(d, layer, '.standards'), { recursive: true });
      writeFileSync(path.join(d, layer, '.standards/STATE.md'), `# Workflow State\n\n${head}\n\n## Active Work\n\n\`Id\`: \`x-1\` \`Scope\`: \`NONE\`\n\n## Handoff\n\n\`From\`: \`${from}\`\n`);
    };
    stateAt('layers/10-cycle', '`WorkflowState`: `DEVELOPING` `CycleMode`: `STANDARD`', 'ARCHITECTING');
    stateAt('layers/20-cancel', '`WorkflowState`: `IDLE` `CycleMode`: `UNSET`', 'DEVELOPING');
    writeFileSync(path.join(d, 'spec.json'), JSON.stringify({ base: null, layers: [{ dir: 'layers/10-cycle', action: 'commit' }, { dir: 'layers/20-cancel', action: 'commit' }] }));
    const changes = migrateStateFiles(d);
    check('migration: a cycle finished in a later layer keeps the policy its earlier layer shows',
      JSON.stringify(changes.map((c) => c.completionPolicy)) === '["FULL_DELIVERABLE","FULL_DELIVERABLE"]', JSON.stringify(changes));
  }
  // A stub `standards` CLI that reported the installed release keeps matching it.
  {
    const { updateStubVersions } = await import('./lib/migrate.mjs');
    const shaOf = (ref) => execFileSync('git', ['rev-parse', ref], { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
    const d = path.join(TMP, 'stub-version');
    mkdirSync(path.join(d, 'runtime'), { recursive: true });
    writeFileSync(path.join(d, 'runtime/standards.mjs'), "const VERSION = '0.8.0';\nconsole.log(VERSION);\n");
    const spec = { runtime: { standardsCli: { mode: 'stub', script: 'runtime/standards.mjs' } }, graderOnly: ['`standards --version` prints version 0.8.0.', 'Unrelated fact.'] };
    const changed = updateStubVersions(d, spec, shaOf('v0.8.0'), shaOf('v0.15.0'));
    check('migration: a stub standards CLI reports the new release, and ground truth that states its version follows',
      readFileSync(path.join(d, 'runtime/standards.mjs'), 'utf8').startsWith("const VERSION = '0.15.0';") && spec.graderOnly[0].includes('version 0.15.0')
        && spec.graderOnly[1] === 'Unrelated fact.' && changed.length === 2, JSON.stringify(changed));
  }
  // The managed AGENTS.md block: the older release's text is replaced and an
  // addition inside the block kept; a block the case changed is left alone.
  {
    const { updateManagedBlocks } = await import('./lib/migrate.mjs');
    const { execFileSync: run } = await import('node:child_process');
    const tpl = (ref) => run('git', ['show', `${ref}:templates/common/AGENTS.md`], { cwd: REPO_ROOT, encoding: 'utf8' });
    const sha = (ref) => run('git', ['rev-parse', ref], { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
    const d = path.join(TMP, 'managed-block');
    mkdirSync(path.join(d, 'layers/50/sub'), { recursive: true });
    const extra = '\n\nAll agents must also log every session.\n';
    const old = tpl('v0.8.0');
    writeFileSync(path.join(d, 'layers/50/AGENTS.md'), `# Project notes\n\n${old.replace('<!-- standards:end -->', `${extra}<!-- standards:end -->`)}`);
    writeFileSync(path.join(d, 'layers/50/sub/AGENTS.md'), '<!-- standards:start -->\nAn older block the case planted.\n<!-- standards:end -->\n');
    const changed = updateManagedBlocks(d, sha('v0.8.0'), sha('v0.15.0'));
    const text = readFileSync(path.join(d, 'layers/50/AGENTS.md'), 'utf8');
    const newBody = tpl('v0.15.0').trimEnd().replace(/<!-- standards:end -->$/, '').trimEnd();
    check('migration: an older release\'s managed AGENTS.md block becomes the current one, keeping an added paragraph; a planted block is left alone',
      JSON.stringify(changed) === JSON.stringify(['layers/50/AGENTS.md']) && text.startsWith('# Project notes\n\n') && text.includes(newBody) && text.includes(extra)
        && readFileSync(path.join(d, 'layers/50/sub/AGENTS.md'), 'utf8').includes('An older block the case planted.'), JSON.stringify(changed));
  }
  // navigator-3 gained a third assertion after its fixture was written: appended.
  const nav = findCase('navigator-3');
  const oldNav = hashOf({ prompt: nav.prompt, expected: nav.expected, assertions: nav.assertions.slice(0, 2) });
  const appended = caseChange(nav, oldNav);
  const unknown = caseChange(nav, '0000000000000000');
  check('migration: a case whose assertions were only appended keeps its fixture; an unknown earlier text needs regeneration',
    caseChange(nav, nav.hash).kind === 'same' && appended.kind === 'appended' && JSON.stringify(appended.added) === '[2]' && unknown.kind === 'changed',
    JSON.stringify({ appended, unknown }));
}

// Committed fixtures: a fixture runs only if its build matches the reviewed
// build, so every file a spec dir holds (except its local generation log, the
// decision logs, and .DS_Store) must reach git. A file git would skip (an
// ignore rule in the repository, inside a layer, or in your global git
// config) breaks that fixture for anyone who clones the repo.
{
  const { uncommittableFixtureFiles } = await import('./lib/readiness.mjs');
  const { userGitEnv } = await import('./lib/config.mjs');
  const missing = uncommittableFixtureFiles(userGitEnv());
  check('committed fixtures: git tracks every fixture file (add any it ignores with `git add -f`)', missing.length === 0, missing.slice(0, 10).join(', '));
}

console.log(failures ? `\nselftest: ${failures} failure(s)` : '\nselftest: all checks passed');
process.exit(failures ? 1 : 0);
