#!/usr/bin/env node
// `pnpm evals references` (evals/README.md, "Run the reference evals").
//
//   node pipeline.mjs [--smoke] [--execute] [--run-id <id>] [--version-budget-usd 90]
//
// Without --execute it calls no model and starts no container. It checks
// version B, the cases, and the graders, and dry-runs each case once in each
// version with run.mjs, which builds the fixture and makes every check a real
// run makes before it starts its container (output under
// evals/runs/references-dry-run/). Then it lists the runs and their estimated
// cost.
//
// With --execute (cli.mjs also sets EVAL_ALLOW_MODEL=1), under one run id:
//   1. every task in versions A and B at the same time, 3 runs at once in each;
//   2. documenter-38 in both versions, and the trigger cases in version A;
//   3. the graders on each finished task run, read detection on every run;
//   4. the blinded judge on the task runs, the masked judge on documenter-38;
//   5. the judge checks;
//   6. evals/runs/<id>/references-summary.md.
// The real runs start only when every task's grader passed check-graders
// with the judge, as the grader and the fixture are now (check-graders.mjs
// records it); --smoke only notes the ones that have not.
// --run-id <id> resumes: finished runs, grades, and verdicts are kept, and
// only what is left runs. Each version stops starting new runs once its runs
// (every part, every attempt) cost --version-budget-usd; a run that never
// reported its cost (stopped by the time limit or by Ctrl+C) counts as
// run.mjs's $50 guard. --smoke: each task once, in version A only, with steps
// 3, 4, and 6; its runs never count.
//
// Each part is one run.mjs run under evals/runs/<id>/<part>/: A, B,
// A-documenter-38, B-documenter-38, A-triggers. The parts get the reference
// evals' cases and fixtures, or the suite's for documenter-38 (plan.mjs).
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CLAUDE_CODE_VERSION, EFFORT, IMAGE, JUDGE_EFFORT, JUDGE_MODEL, MODEL, REPO_ROOT, RUNS_ROOT } from '../lib/config.mjs';
import { dockerAvailable } from '../lib/selfcheck.mjs';
import { BASE_COMMIT, EXPECTED_SHA, TAG } from './build-b.mjs';
import { PASSED, checkInputsHash } from './check-graders.mjs';
import { GRADERS_ROOT, gradeRun, graderHash, loadGrader } from './graders.mjs';
import { blindJobs, judgeBlind, judgeProbe, referenceJudgeChecks } from './judge.mjs';
import { BUDGET_USD, FIXTURES_DIR, PROBE, REFERENCES_ENV, SUITE_ENV, VERSIONS, estimate, makePlan, referenceCases, runArgs } from './plan.mjs';
import { readsForRun } from './reads.mjs';
import { summarizeReferences } from './summary.mjs';

const HARNESS = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const readJson = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null);
const SCORED = new Set(['GRADED', 'OVER_BUDGET', 'TIMEOUT']);
// run.mjs charges a run whose cost is unknown (killed) at its per-run guard.
const RUN_GUARD_USD = 50;
const DRY_ID = 'references-dry-run';

// Version B must be the local tag at the pinned commit.
export function versionBProblem() {
  const r = spawnSync('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${TAG}^{commit}`], { cwd: REPO_ROOT, encoding: 'utf8' });
  if (r.status !== 0) return `version B is not built yet: run pnpm evals references build-b`;
  if (r.stdout.trim() !== EXPECTED_SHA) return `the tag ${TAG} points to ${r.stdout.trim().slice(0, 7)}, not version B (${EXPECTED_SHA.slice(0, 7)}); see pnpm evals references build-b --check`;
  return null;
}

// What must hold before any case runs: a grader of the right kind for each
// case, and assertions the suite's judge never grades (it sees the
// transcript, so it is not blind): each one complete with exact checks, or NA.
export function caseProblems(cases = referenceCases(), { gradersRoot = GRADERS_ROOT, fixturesDir = FIXTURES_DIR } = {}) {
  const problems = [];
  for (const c of cases.filter((x) => x.kind)) {
    const g = loadGrader(path.join(gradersRoot, c.key));
    for (const p of g.problems) problems.push(`${c.key}: grader: ${p}`);
    if (g.manifest && g.kind !== (c.kind === 'task' ? 'task' : 'trigger')) problems.push(`${c.key}: its grader.json is for a ${g.kind}, but the case is numbered as a ${c.kind}`);
    const specFile = path.join(fixturesDir, c.role, String(c.id), 'spec.json');
    if (!existsSync(specFile)) continue; // the dry run reports a missing fixture
    const by = new Map((readJson(specFile).checks ?? []).map((x) => [x.assertion, x]));
    const open = c.assertions.map((_, i) => i).filter((i) => !(by.get(i)?.complete || by.get(i)?.na));
    if (open.length) problems.push(`${c.key}: assertion${open.length > 1 ? 's' : ''} ${open.join(', ')} would need the suite's judge, which sees the transcript: decide each with exact checks ("complete": true) or mark it NA`);
  }
  return problems;
}

// What a version has spent so far: every repetition and attempt of its parts.
// A run that started (it has a transcript) but never reported its cost counts
// as the guard: killed by the time limit, or stopped by Ctrl+C before run.mjs
// wrote its usage. One that never started its container costs nothing.
export function spentBy(root, version, parts) {
  let usd = 0;
  let unknown = 0;
  for (const p of parts.filter((x) => x.version === version)) {
    const cases = path.join(root, p.name, 'cases');
    if (!existsSync(cases)) continue;
    for (const k of readdirSync(cases, { withFileTypes: true }).filter((e) => e.isDirectory())) {
      for (const r of readdirSync(path.join(cases, k.name), { withFileTypes: true }).filter((e) => e.isDirectory())) {
        const dir = path.join(cases, k.name, r.name);
        const u = readJson(path.join(dir, 'usage.json'));
        const known = u && !u.costUnknown && u.costUsd !== null && u.costUsd !== undefined;
        if (known) usd += u.costUsd;
        else if (u || existsSync(path.join(dir, 'transcript.jsonl'))) { usd += RUN_GUARD_USD; unknown += 1; }
      }
    }
  }
  return { usd, unknown };
}

// Tasks whose grader has not passed check-graders --execute as everything the
// check depends on is now: the grader folder, the reviewed fixture build, and
// the facts, runtime, and judge (check-graders.mjs).
export function uncheckedGraders(tasks, { passedFile = PASSED, gradersRoot = GRADERS_ROOT, fixturesDir = FIXTURES_DIR } = {}) {
  const passed = readJson(passedFile) ?? {};
  return tasks.filter((key) => {
    const [, role, id] = key.match(/^(.*)-(\d+)$/);
    const specDir = path.join(fixturesDir, role, id);
    const reviewed = readJson(path.join(specDir, 'spec.json'))?.reviewedBy?.fixtureHash;
    const p = passed[key];
    const inputs = checkInputsHash(specDir);
    return !(p?.judged && p.graderHash === graderHash(path.join(gradersRoot, key)) && p.fixtureHash === reviewed && inputs && p.inputsHash === inputs);
  });
}
const UNCHECKED = 'its grader has not passed pnpm evals references check-graders --execute as the grader, the fixture, and the judge are now';

// One part as a run.mjs child with that part's settings. Output lines get the
// part's name; Ctrl+C reaches the child too, which stops its containers.
const children = new Set();
function runPart(part, { runId, budgetUsd = null, execute = false, quiet = false }) {
  const env = { ...process.env, ...(part.env === 'suite' ? SUITE_ENV : REFERENCES_ENV) };
  if (!execute) delete env.EVAL_ALLOW_MODEL;
  const argv = runArgs(part, { runId, model: MODEL, effort: EFFORT, budgetUsd, execute });
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(HARNESS, 'run.mjs'), ...argv], { stdio: ['ignore', 'pipe', 'pipe'], env });
    children.add(child);
    let out = '';
    const relay = (stream) => {
      let rest = '';
      child[stream].setEncoding('utf8');
      child[stream].on('data', (d) => {
        out += d;
        if (quiet) return;
        const lines = (rest + d).split('\n');
        rest = lines.pop();
        for (const l of lines) process[stream].write(`[${part.name}] ${l}\n`);
      });
      child[stream].on('end', () => { if (!quiet && rest) process[stream].write(`[${part.name}] ${rest}\n`); });
    };
    relay('stdout');
    relay('stderr');
    child.on('close', (code) => { children.delete(child); resolve({ code: code ?? 1, out }); });
  });
}

// Repetition folders of a part that finished (scored statuses), from results.json.
function finishedReps(root, part) {
  const results = readJson(path.join(root, part.name, 'results.json')) ?? [];
  return results.filter((r) => r.rep && SCORED.has(r.status)).map((r) => ({ part, key: r.key, rep: r.rep, dir: path.join(root, part.name, 'cases', r.key, `r${r.rep}`) }))
    .filter((r) => existsSync(path.join(r.dir, 'after.json')));
}
const everyRep = (root, part) => {
  const cases = path.join(root, part.name, 'cases');
  if (!existsSync(cases)) return [];
  return readdirSync(cases, { withFileTypes: true }).filter((e) => e.isDirectory()).flatMap((k) => readdirSync(path.join(cases, k.name)).filter((r) => /^r\d+$/.test(r))
    .map((r) => ({ part, key: k.name, dir: path.join(cases, k.name, r) })));
};

async function pool(items, n, fn) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (next < items.length) await fn(items[next++]); }));
}

function header(plan) {
  console.log(`Reference evals${plan.smoke ? ' (smoke test)' : ''}\n  version A: release 0.15.0 (${BASE_COMMIT.slice(0, 7)})${plan.smoke ? '' : `; version B: ${TAG} (${EXPECTED_SHA.slice(0, 7)})`}`
    + `\n  under test ${MODEL} (${EFFORT}) via Claude Code ${CLAUDE_CODE_VERSION}; judge ${JUDGE_MODEL} (${JUDGE_EFFORT})\n`);
}
function planLines(plan) {
  const e = estimate(plan);
  const usd = ([lo, hi]) => `$${lo.toFixed(0)}–${hi.toFixed(0)}`;
  return [`Runs: ${e.count || 'none'}`, ...plan.parts.map((p) => `  ${p.name.padEnd(17)} ${p.reps} each: ${p.cases.join(', ')}`),
    `Estimated cost: runs ${usd(e.runs)}, judge ${usd(e.judge)}${plan.smoke ? '' : `, judge checks ${usd(e.checks)}`}; about ${usd(e.total)} in all (estimate)`];
}

async function dryRun(plan) {
  header(plan);
  const problems = [...plan.problems, ...caseProblems()];
  const b = plan.smoke ? null : versionBProblem();
  if (b) problems.push(b);
  const unchecked = uncheckedGraders(plan.tasks).map((k) => `${k}: ${UNCHECKED}`);
  if (plan.smoke) { if (unchecked.length) console.log(`Note (a smoke test can run anyway):\n${unchecked.map((u) => `  ${u}`).join('\n')}\n`); } else problems.push(...unchecked);
  console.log(problems.length ? `Checks:\n${problems.map((p) => `  FAIL ${p}`).join('\n')}\n` : `Checks: version ${plan.smoke ? 'A' : 'B'}, cases, and graders are ready\n`);
  // One dry run per case in each version, with the checks a real run makes first.
  const dryRoot = path.join(RUNS_ROOT, DRY_ID);
  rmSync(dryRoot, { recursive: true, force: true });
  const parts = plan.parts.filter((p) => p.version === 'A' || !b).map((p) => ({ ...p, reps: 1 }));
  if (parts.length) console.log('Fixtures (each case built as a run builds it, in its version; this can take a few minutes):');
  const got = await Promise.all(parts.map(async (p) => ({ p, ...(await runPart(p, { runId: DRY_ID, quiet: true })) })));
  let notReady = 0;
  for (const { p, out } of got) {
    const results = readJson(path.join(dryRoot, p.name, 'results.json'));
    if (!results) { notReady += p.cases.length; console.log(`  ${p.name.padEnd(17)} could not run:\n${out.trim().split('\n').slice(-5).map((l) => `    ${l}`).join('\n')}`); continue; }
    const bad = results.filter((r) => r.status !== 'DRY_RUN');
    notReady += bad.length;
    console.log(`  ${p.name.padEnd(17)} ${p.cases.length} case${p.cases.length === 1 ? '' : 's'}: ${p.cases.length - bad.length} ready`);
    for (const r of bad) console.log(`    ${r.key}: ${r.error ?? r.status}`);
  }
  console.log(`\n${planLines(plan).join('\n')}`);
  const ready = !problems.length && !notReady && parts.length === plan.parts.length;
  console.log(ready ? '\nAdd --execute to run them.' : '\nFix the problems above first.');
  return ready ? 0 : 1;
}

async function executeRun(plan, argv) {
  header(plan);
  const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
  const problems = [...plan.problems, ...caseProblems()];
  if (!plan.smoke) {
    const b = versionBProblem();
    if (b) problems.push(b);
    problems.push(...uncheckedGraders(plan.tasks).map((k) => `${k}: ${UNCHECKED}`));
  } else {
    for (const k of uncheckedGraders(plan.tasks)) console.log(`Note: ${k}: ${UNCHECKED}`);
  }
  if (MODEL === JUDGE_MODEL) problems.push(`the model under test (${MODEL}) is also the judge, which would grade its own runs; set EVAL_JUDGE_MODEL to a different model`);
  if (!dockerAvailable(IMAGE)) problems.push(`Docker or the runner image ${IMAGE} is not available: start Docker, or run pnpm evals image build`);
  if (problems.length) { console.error(`Not started:\n${problems.map((p) => `  ${p}`).join('\n')}`); return 1; }
  const budget = Number(opt('--version-budget-usd', BUDGET_USD));
  if (!(budget > 0)) { console.error('--version-budget-usd must be a positive number'); return 1; }

  const given = argv.includes('--run-id') ? opt('--run-id', '') : null;
  if (given !== null && !/^[\w.-]+$/.test(given ?? '')) { console.error('--run-id takes a run id: letters, digits, dots, dashes, and underscores'); return 1; }
  const runId = given ?? `${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}Z-references${plan.smoke ? '-smoke' : ''}`;
  const root = path.join(RUNS_ROOT, runId);
  // The plan a run started with; a resume must not change it.
  const record = { runId, smoke: plan.smoke, model: MODEL, effort: EFFORT, claudeCode: CLAUDE_CODE_VERSION, judge: JUDGE_MODEL,
    versions: Object.fromEntries(Object.entries(VERSIONS).filter(([v]) => plan.parts.some((p) => p.version === v)).map(([v, x]) => [v, { commit: spawnSync('git', ['rev-parse', x.commit], { cwd: REPO_ROOT, encoding: 'utf8' }).stdout.trim(), reviewedAt: x.reviewedAt }])),
    parts: plan.parts };
  const file = path.join(root, 'references.json');
  const earlier = readJson(file);
  if (earlier) {
    const same = (x) => JSON.stringify({ ...x, runId: undefined, startedAt: undefined, budgetUsd: undefined });
    if (same(earlier) !== same(record)) { console.error(`${runId} was started with another plan (cases, versions, model, or --smoke); start a new run instead of resuming it`); return 1; }
    console.log(`Resuming ${runId}.`);
  } else {
    mkdirSync(root, { recursive: true });
  }
  writeFileSync(file, JSON.stringify({ ...record, budgetUsd: budget, startedAt: earlier?.startedAt ?? new Date().toISOString() }, null, 2));
  console.log(`Run id: ${runId}\nIf this stops early, run the same command with --run-id ${runId}: finished runs, grades, and verdicts are kept.\n${planLines(plan).join('\n')}\n`);

  let interrupted = false;
  process.on('SIGINT', () => {
    // The run.mjs children stop their own containers; wait for them, then stop.
    interrupted = true;
    if (!children.size) { console.error(`\nStopped. Rerun with --run-id ${runId} to finish.`); process.exit(130); }
  });
  const stopped = () => { if (interrupted) { console.error(`\nStopped. Rerun with --run-id ${runId} to finish.`); process.exit(130); } };

  // 1 and 2: the runs. Each part's budget is what its version has left.
  let runErrors = 0;
  const go = async (part) => {
    if (interrupted) return;
    const spent = spentBy(root, part.version, plan.parts);
    const left = budget - spent.usd;
    if (left <= 0) {
      console.log(`[${part.name}] not started: version ${part.version} has $${spent.usd.toFixed(2)} counted against its $${budget}`
        + `${spent.unknown ? ` (${spent.unknown} runs that never reported their cost count as $${RUN_GUARD_USD} each)` : ''}; add --version-budget-usd <amount> to allow more`);
      return;
    }
    const { code } = await runPart(part, { runId, budgetUsd: Number(left.toFixed(2)), execute: true });
    if (code) runErrors += 1;
  };
  const by = Object.fromEntries(plan.parts.map((p) => [p.name, p]));
  await Promise.all(plan.parts.filter((p) => p.kind === 'tasks').map(go));
  stopped();
  await Promise.all([[by['A-documenter-38'], by['A-triggers']], [by['B-documenter-38']]].map(async (chain) => { for (const p of chain.filter(Boolean)) await go(p); }));
  stopped();

  // 3: graders on each finished task run (again when its grader changed or
  // gave an error), and read detection on every run.
  const graders = new Map(plan.tasks.map((k) => [k, loadGrader(path.join(GRADERS_ROOT, k))]));
  const taskReps = plan.parts.filter((p) => p.kind === 'tasks').flatMap((p) => finishedReps(root, p));
  const toGrade = taskReps.filter((r) => {
    const post = readJson(path.join(r.dir, 'post-checks.json'));
    return !post || post.problems?.length || post.checks.some((c) => c.verdict === 'ERROR') || post.graderHash !== graderHash(path.join(GRADERS_ROOT, r.key));
  });
  if (toGrade.length) console.log(`Grading ${toGrade.length} task runs in Docker...`);
  await pool(toGrade, 3, async (r) => {
    try { await gradeRun(r.dir); } catch (error) { console.error(`[grade] ${path.relative(root, r.dir)}: ${error.message}`); }
  });
  stopped();
  for (const r of plan.parts.flatMap((p) => everyRep(root, p))) {
    if (!existsSync(path.join(r.dir, 'transcript.jsonl'))) continue;
    try { readsForRun(r.dir, { rules: r.part.kind === 'tasks' ? graders.get(r.key)?.manifest?.rules ?? [] : [] }); } catch (error) { console.error(`[reads] ${path.relative(root, r.dir)}: ${error.message}`); }
  }

  // 4: the judge, on both versions' runs in one mixed queue.
  const jobs = taskReps.map((r) => {
    const g = graders.get(r.key)?.manifest;
    const [, role, id] = r.key.match(/^(.*)-(\d+)$/);
    const spec = readJson(path.join(FIXTURES_DIR, role, id, 'spec.json')) ?? {};
    return g?.judge?.items?.length ? { dir: r.dir, items: blindJobs({ dir: r.dir, grader: g, spec }) } : null;
  }).filter(Boolean);
  const blind = await judgeBlind(jobs, { label: runId });
  console.log(`Judge: ${blind.sent} items sent, ${blind.kept} kept from before.`);
  stopped();
  const probeDirs = plan.parts.filter((p) => p.kind === 'probe').map((p) => path.join(root, p.name)).filter((d) => existsSync(d));
  if (probeDirs.length) {
    const probe = await judgeProbe(probeDirs, { label: runId });
    console.log(`${PROBE}: ${probe.sent} judge calls sent${probe.blocked ? `, ${probe.blocked} blocked` : ''}.`);
  }
  stopped();

  // 5: judge checks, then 6: the summary.
  let checksExit = 0;
  if (!plan.smoke) {
    const checks = await referenceJudgeChecks({ outDir: root, label: runId, blindDirs: taskReps.map((r) => r.dir), probeRunDirs: probeDirs });
    console.log(`\nJudge checks:\n${checks.md}\n`);
    checksExit = checks.exit;
  }
  const summary = summarizeReferences(root);
  console.log(`Summary: ${path.join(root, 'references-summary.md')}${summary.problems.length ? ` (${summary.problems.length} problems listed)` : ''}`);
  if (runErrors) console.log(`Some runs ended with an error. Rerun with --run-id ${runId} to retry only those.`);
  return runErrors ? 1 : checksExit;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const plan = makePlan({ smoke: argv.includes('--smoke') });
  if (argv.includes('--execute') && process.env.EVAL_ALLOW_MODEL !== '1') {
    console.error('Model runs are off: run this through `pnpm evals references --execute`.');
    process.exit(1);
  }
  process.exit(await (argv.includes('--execute') ? executeRun(plan, argv) : dryRun(plan)));
}
