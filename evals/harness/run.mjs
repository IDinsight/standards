#!/usr/bin/env node
// Run cases: build each fixture, run the role once in a disposable container,
// capture everything, grade. Without --execute it only prints what it would
// run; `pnpm eval run ... --execute` (cli.mjs) also sets EVAL_ALLOW_MODEL=1.
//
//   node run.mjs --cases developer-1,navigator-3 [--reps 1] [--concurrency 6]
//   node run.mjs --role tester [...]      (every case of one role; see below)
//   node run.mjs --all [...]              (every case of every role)
//                [--model claude-sonnet-5-5] [--effort <level>] [--client claude]
//                [--run-id <id>] [--execute]
//
// Layout written under evals/runs/<run-id>/:
//   run.json                        config, framework commit, versions, prices
//   cases/<case>/r<n>/              one directory per repetition
//     fixture.json  before.json  after.json  before.tar.gz  after.tar.gz  after/  diff.patch
//     transcript.jsonl  stderr.log  reply.md  usage.json  verdicts.json
//     session/          Claude Code's own session files from the container
//     seeding.json      history cases: whether the forked session held the seeded turns
//
// Each container gets: the fixture at spec.runtime.projectPath (default
// /work), a fresh ~/.claude (only a seeded session, for history cases), and
// /opt/eval (entry script, the runtime block, a standards shim or stub). See
// lib/runtime.mjs for the runtime block.
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { cpSync, createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { BASES_DIR, buildFixture, frameworkAt, resolveSpec } from './build-fixture.mjs';
import { DOCKER_KEY_ARGS, NO_HELPERS, apiKeyProblems, dockerKeyEnv, gitHolds, redactKey } from './lib/credentials.mjs';
import { checkFacts } from './validate-fixture.mjs';
import { DEFAULT_COMMIT, FIXTURES_ROOT, REPO_ROOT, ROLES, findCase, loadRole } from './lib/cases.mjs';
import { caseState } from './lib/readiness.mjs';
import { CLAUDE_CODE_VERSION, EFFORT, IMAGE, MODEL, RUNS_ROOT } from './lib/config.mjs';
import { DEFAULT_BLOCK_HOSTS, blockHostArgs, prepareRuntime, imageFor } from './lib/runtime.mjs';
import { seedSession, verifySeeding } from './lib/session.mjs';
import { git, snapshot, unsafeGitConfig } from './lib/snapshot.mjs';
import { parseTranscript, runReachedRole } from './lib/trace.mjs';
import { grade } from './grade.mjs';

const args = Object.fromEntries(process.argv.slice(2).join(' ').split(/\s+--/).filter(Boolean)
  .map((a) => a.replace(/^--/, '').split(/\s+/)).map(([k, ...v]) => [k, v.length ? v.join(' ') : true]));
// --role <name>: every case of that role (--all: of every role). A case
// whose fixture is not ready to run (lib/readiness.mjs: deferred, missing,
// waiting for a review or a decision, migrated without its selfChecks, ...)
// is listed in results.json as NOT_RUN with the reason; with --allow-draft
// only deferred and missing ones are.
const notRun = [];
function roleCases(role) {
  return loadRole(role).filter((c) => {
    const { state, why } = caseState(c, commit);
    if (state === 'ready' || (args['allow-draft'] === true && !['deferred', 'missing'].includes(state))) return true;
    notRun.push({ key: c.key, status: 'NOT_RUN', error: `${state}: ${why}` });
    return false;
  }).map((c) => c.key);
}
// Framework commit to install into fixtures; recorded in run.json.
const commit = git(REPO_ROOT, ['rev-parse', args.commit ?? DEFAULT_COMMIT]);
const cfg = {
  cases: args.all ? ROLES.flatMap(roleCases) : args.role ? roleCases(args.role) : String(args.cases ?? '').split(',').filter(Boolean),
  role: args.role ?? null,
  reps: Number(args.reps ?? 1),
  concurrency: Number(args.concurrency ?? 6),
  client: args.client ?? 'claude',
  // Model under test and its effort, passed to Claude Code and recorded in run.json.
  model: args.model ?? MODEL,
  effort: args.effort ?? EFFORT,
  // Stuck-run guard, not a spending cap: Claude Code stops a single run past
  // it, which is graded OVER_BUDGET. Far above any expected run.
  budgetUsd: Number(args['budget-usd'] ?? 50),
  // Optional: stop starting new runs past this total. No limit unless given.
  suiteBudgetUsd: args['suite-budget-usd'] === undefined ? Infinity : Number(args['suite-budget-usd']),
  timeoutMin: Number(args['timeout-min'] ?? 20),
  image: args.image ?? IMAGE,
  // Framework commit to install into fixtures; recorded in run.json.
  commitArg: args.commit ?? DEFAULT_COMMIT,
  // Hosts made unreachable inside the container, so a role cannot fetch the
  // public repository (which contains skills/*/evals/) or other answer sources.
  blockHosts: args['block-hosts'] ? String(args['block-hosts']).split(',').filter(Boolean) : DEFAULT_BLOCK_HOSTS,
  // Only specs marked "reviewed" run: passed the model review (gate 3), or the
  // owner decided on its flagged issues. "draft", "gated", "flagged", and
  // "rejected" never do, unless --allow-draft (samples, tests).
  allowDraft: args['allow-draft'] === true,
  execute: args.execute === true,
};
// The Claude Code version pinned in the image (Dockerfile); seeded sessions carry it.
const CLAUDE_VERSION = args['claude-version'] ?? CLAUDE_CODE_VERSION;
const runId = args['run-id'] ?? `${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}Z-${commit.slice(0, 7)}-${cfg.model}${cfg.role ? `-${cfg.role}` : ''}`;
const runRoot = path.join(RUNS_ROOT, runId);

// The user message: the client's skill invocation plus the fixture's utterance.
const message = (spec) => (cfg.client === 'codex' ? `$${spec.prompt.skill}` : `/${spec.prompt.skill}`) + ` ${spec.prompt.utterance}`;

// The container command. Claude Code refuses bypassPermissions as root, so the
// image runs as an unprivileged user; the container is the permission boundary.
function command(spec, resume = null, extra = []) {
  if (cfg.client === 'claude') {
    return ['claude', '-p', message(spec), ...(resume ? ['--resume', resume, '--fork-session'] : []), ...extra,
      '--model', cfg.model, ...(cfg.effort ? ['--effort', cfg.effort] : []),
      '--output-format', 'stream-json', '--verbose', '--include-hook-events',
      '--permission-mode', 'bypassPermissions', '--max-budget-usd', String(cfg.budgetUsd),
      '--setting-sources', 'project,local', '--strict-mcp-config',
      // Roles need no web access; this also keeps the public repo's evals out of reach.
      '--disallowedTools', 'WebFetch', 'WebSearch'];
  }
  // Codex flags are unverified: no Codex run has been tried.
  return ['codex', 'exec', '--json', '--model', cfg.model, '--sandbox', 'workspace-write', '-C', '/work', message(spec)];
}

async function runOne(key, rep) {
  const kase = findCase(key);
  const specDir = path.join(FIXTURES_ROOT, kase.role, String(kase.id));
  const spec = JSON.parse((await import('node:fs')).readFileSync(path.join(specDir, 'spec.json'), 'utf8'));
  // The fixture must be ready to run at this commit (lib/readiness.mjs).
  if (!cfg.allowDraft) {
    const { state, why } = caseState(kase, commit);
    if (state !== 'ready') return { key, rep, status: 'ERROR', error: `fixture not ready (${state}): ${why}` };
  }
  // Spec status must be "reviewed" (see allowDraft above).
  if (spec.status !== 'reviewed' && !cfg.allowDraft) return { key, rep, status: 'ERROR', error: `fixture spec is ${spec.status ?? 'unmarked'}; only reviewed specs run (or pass --allow-draft)` };
  // Every shared base under the case must be reviewed too.
  if (!cfg.allowDraft) {
    for (const b of resolveSpec(specDir).bases) {
      const st = JSON.parse(readFileSync(path.join(BASES_DIR, b.name, 'spec.json'), 'utf8')).status;
      if (st !== 'reviewed') return { key, rep, status: 'ERROR', error: `base ${b.name} is ${st}; only reviewed bases run` };
    }
  }
  const dir = path.join(runRoot, 'cases', key, `r${rep}`);
  // The live repo stays outside results/ (no nested git repos there); results
  // keep tarballs with .git and a .git-free copy for graders and reviewers.
  const work = path.join(os.tmpdir(), 'standards-eval-work', runId, key, `r${rep}`);
  mkdirSync(dir, { recursive: true });
  const build = buildFixture({ specDir, out: work, client: cfg.client, commit });
  writeFileSync(path.join(dir, 'fixture.json'), JSON.stringify(build, null, 2));
  if (build.problems.length) return { key, rep, status: 'ERROR', error: `fixture: ${build.problems.join('; ')}` };
  // Only the exact build that passed review (or the owner's fix) runs.
  if (!cfg.allowDraft && spec.reviewedBy?.fixtureHash && build.fixtureHash !== spec.reviewedBy.fixtureHash) {
    return { key, rep, status: 'ERROR', error: `fixture build ${build.fixtureHash} differs from the reviewed build ${spec.reviewedBy.fixtureHash}; re-review` };
  }
  if (!cfg.allowDraft && !spec.reviewedBy?.fixtureHash) return { key, rep, status: 'ERROR', error: 'the spec records no reviewed build; re-review' };
  const before = await snapshot(work, { commit });
  // Gate 2 on the exact fixture this run uses: stated prompt facts must match.
  const facts = checkFacts(kase, work, before, spec.factExemptions);
  if (facts.problems.length) return { key, rep, status: 'ERROR', error: `fixture contradicts prompt: ${facts.problems.join('; ')}` };
  writeFileSync(path.join(dir, 'before.json'), JSON.stringify(before, null, 2));
  execFileSync('tar', ['-czf', path.join(dir, 'before.tar.gz'), '-C', work, '.']);

  // Some cases need the project at a specific path (for example /work/bootstrap-demo).
  const runtime = resolveSpec(specDir).runtime;
  const projectRoot = runtime.projectPath ?? '/work';
  const evalDir = `${work}-eval`;
  const claudeHome = `${work}-claude`;
  rmSync(claudeHome, { recursive: true, force: true });
  mkdirSync(claudeHome, { recursive: true });
  const rt = prepareRuntime({ runtime, specDir, evalDir, projectRoot, framework: frameworkAt(commit) });
  // History cases: a seeded session the run resumes and forks (lib/session.mjs).
  let seed = null;
  if (spec.history?.turns?.length) {
    seed = seedSession({ turns: spec.history.turns, cwd: projectRoot, version: CLAUDE_VERSION, model: cfg.model, key: `${key}-r${rep}` });
    mkdirSync(path.join(claudeHome, 'projects', seed.dir), { recursive: true });
    writeFileSync(path.join(claudeHome, 'projects', seed.dir, seed.file), seed.jsonl);
  }
  const outside = (runtime.outsideDirs ?? []).map((d, n) => { const host = `${work}-outside-${n}`; rmSync(host, { recursive: true, force: true }); mkdirSync(host, { recursive: true }); return ['-v', `${host}:${d}`]; }).flat();
  // The key reaches only the container, through the docker client's
  // environment (lib/credentials.mjs), never the command line.
  // The fixture is mounted at /mnt/project; entry.sh copies it into the
  // container's own filesystem at projectRoot and back (see container/entry.sh).
  // A named container with an init process, so an interrupted harness can
  // stop it (see stopContainers) instead of leaving the role running and billing.
  const name = `standards-eval-${runId}-${key}-r${rep}-${Date.now().toString(36)}`.replace(/[^a-zA-Z0-9_.-]/g, '-');
  const docker = ['run', '--rm', '--init', '--name', name, ...DOCKER_KEY_ARGS, '-v', `${work}:/mnt/project`,
    '-v', `${evalDir}:/opt/eval:ro`, '-v', `${claudeHome}:/home/runner/.claude`, ...rt.mounts, ...outside,
    ...blockHostArgs([...cfg.blockHosts, ...(runtime.blockHosts ?? [])]), ...rt.user,
    '--cpus', '2', '--memory', '4g', imageFor(runtime, cfg.image), 'sh', '/opt/eval/entry.sh', String(cfg.timeoutMin), ...command(spec, seed?.sessionId, rt.claudeArgs)];
  writeFileSync(path.join(dir, 'run.json'), JSON.stringify({ projectRoot, case: key, rep, runtime, seeded: seed ? { sessionId: seed.sessionId, turns: seed.texts.length } : null, docker: ['docker', ...docker] }, null, 2));
  if (!cfg.execute) {
    console.log(`[dry-run] ${key} r${rep}: docker ${docker.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ')}`);
    return { key, rep, status: 'DRY_RUN' };
  }
  if (process.env.EVAL_ALLOW_MODEL !== '1') throw new Error('Model runs are off; run through `pnpm eval run ... --execute` (or set EVAL_ALLOW_MODEL=1).');
  const keyProblems = apiKeyProblems();
  if (keyProblems.length) throw new Error(keyProblems.join('; '));

  const started = Date.now();
  const out = createWriteStream(path.join(dir, 'transcript.jsonl'));
  const err = createWriteStream(path.join(dir, 'stderr.log'));
  live.add(name);
  const code = await new Promise((resolve) => {
    const child = spawn('docker', docker, { stdio: ['ignore', 'pipe', 'pipe'], env: dockerKeyEnv() });
    child.stdout.pipe(out);
    child.stderr.pipe(err);
    child.on('close', resolve);
  });
  live.delete(name);
  // Wait until both log files are flushed before parsing them.
  await Promise.all([out, err].map((s) => (s.writableFinished ? null : new Promise((r) => s.on('finish', r)))));
  const wallMs = Date.now() - started;
  // The key never stays in a saved artifact: it is redacted from the project,
  // the session files, and the logs before anything is copied, graded, or
  // judged. A key in the project's git history (compressed objects) cannot be
  // redacted in place, so the after-run tarball is not kept.
  const redacted = redactKey([work, claudeHome, dir], { skip: ['.git'] }).map((f) => path.relative(path.dirname(work), f));
  // Everything below inspects the run's repository with git on the host. Git
  // config the run left that would make that run commands (filters, includes)
  // stops here: the run is kept as it is, for a person to look at.
  const unsafe = unsafeGitConfig(work);
  if (unsafe.length) {
    writeFileSync(path.join(dir, 'unsafe-git.json'), JSON.stringify({ keys: unsafe, project: work }, null, 2));
    const t = parseTranscript(path.join(dir, 'transcript.jsonl'), projectRoot);
    const costUsd = t.usage?.costUsd ?? null;
    writeFileSync(path.join(dir, 'usage.json'), JSON.stringify({ exitCode: code, wallMs, ...t.usage, costUsd, costUnknown: costUsd === null }, null, 2));
    return { key, rep, status: 'ERROR', error: `the run left git config the harness will not run on the host (${unsafe.join(', ')}); the project is kept at ${work}`, wallMs, costUsd, costUnknown: costUsd === null };
  }
  const keyInGit = gitHolds(work, (repo, args) => git(repo, args, { maxBuffer: 1 << 28 }));
  if (redacted.length || keyInGit) {
    writeFileSync(path.join(dir, 'redaction.json'), JSON.stringify({ files: redacted, keyInGitHistory: keyInGit }, null, 2));
    console.warn(`WARNING ${key} r${rep}: the API key appeared in run output (${redacted.length} files redacted${keyInGit ? '; also in git history, tarball not kept' : ''}); see redaction.json`);
  }
  // Claude Code's own session files (and, for history cases, whether the
  // forked session really held the seeded turns).
  if (existsSync(path.join(claudeHome, 'projects'))) cpSync(path.join(claudeHome, 'projects'), path.join(dir, 'session'), { recursive: true });
  if (seed) writeFileSync(path.join(dir, 'seeding.json'), JSON.stringify(verifySeeding(claudeHome, seed, seed.jsonl), null, 2));
  writeFileSync(path.join(dir, 'after.json'), JSON.stringify(await snapshot(work, { commit }), null, 2));
  if (!keyInGit) execFileSync('tar', ['-czf', path.join(dir, 'after.tar.gz'), '-C', work, '.']);
  // verbatimSymlinks: a relative link stays as the role left it (not rewritten into the temp dir).
  cpSync(work, path.join(dir, 'after'), { recursive: true, verbatimSymlinks: true, filter: (src) => !src.split(path.sep).includes('.git') });
  // Full before->after diff, including untracked and deleted files.
  const beforeDir = path.join(dir, 'before');
  mkdirSync(beforeDir);
  execFileSync('tar', ['-xzf', path.join(dir, 'before.tar.gz'), '-C', beforeDir, '--exclude', './.git']);
  let patch;
  try { patch = execFileSync('git', ['diff', '--no-index', '--binary', ...NO_HELPERS, '--', 'before', 'after'], { cwd: dir, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) {
    patch = e.stdout ?? ''; // exit 1 means "differences found"
  }
  writeFileSync(path.join(dir, 'diff.patch'), patch); // empty file when nothing changed
  rmSync(beforeDir, { recursive: true, force: true });
  const trace = parseTranscript(path.join(dir, 'transcript.jsonl'), projectRoot);
  writeFileSync(path.join(dir, 'reply.md'), trace.reply);
  // A killed run (timeout, crash) has no result event, so its real spend is
  // unknown. It is recorded as unknown (not guessed) and counted apart in the
  // summary; the optional suite budget charges it at the guard amount.
  const costUnknown = trace.usage?.costUsd === undefined;
  const costUsd = costUnknown ? null : trace.usage.costUsd;
  writeFileSync(path.join(dir, 'usage.json'), JSON.stringify({ exitCode: code, wallMs, ...trace.usage, costUsd, costUnknown }, null, 2));
  // A run stopped by --max-budget-usd ended because of the role's own behavior:
  // grade its end state but report it separately. Claude Code marks this
  // with a result subtype containing "budget".
  const overBudget = /budget/i.test(trace.usage?.subtype ?? '');
  // A run that hit the time limit is reported on its own (TIMEOUT): neither a
  // model failure nor retried, since a retry would double the cost of what is
  // most often a stuck role. Crashes and API errors are infrastructure errors.
  if (!overBudget && code === 124) return { key, rep, status: 'TIMEOUT', error: `hit the ${cfg.timeoutMin}-minute limit`, wallMs, costUsd, costUnknown };
  if (!overBudget && (code !== 0 || !trace.usage)) return { key, rep, status: 'ERROR', error: `exit ${code}`, wallMs, costUsd, costUnknown, retryable: true };
  // The run must have reached the role under test with the requested model.
  const unreached = runReachedRole(trace, { role: spec.prompt.skill, model: cfg.model });
  writeFileSync(path.join(dir, 'session-check.json'), JSON.stringify({ init: trace.init, problem: unreached }, null, 2));
  if (unreached) return { key, rep, status: 'ERROR', error: unreached, wallMs, costUsd, costUnknown };
  // A history case whose forked session did not hold the seeded turns ran
  // without its premise: an infrastructure error (the seeding format), not a
  // model result. Not retried: the same seed would fail the same way.
  if (seed) {
    const seeding = JSON.parse(readFileSync(path.join(dir, 'seeding.json'), 'utf8'));
    if (!seeding.ok) return { key, rep, status: 'ERROR', error: `seeded session not loaded: ${seeding.reason ?? `${seeding.matched}/${seeding.of} turns`}`, wallMs, costUsd, costUnknown };
  }
  const verdicts = await grade(dir, specDir, { judge: 'dry' });
  return { key, rep, status: overBudget ? 'OVER_BUDGET' : 'GRADED', wallMs, costUsd, verdicts };
}

const omit = (o, key) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== key));

// Containers still running. On Ctrl+C or a kill signal they are stopped at
// once: otherwise each role keeps calling the model until its time limit, and
// a resumed run would pay for it again. Finished results are saved first.
const live = new Set();
let stopping = false;
function stopContainers(signal) {
  if (stopping) return;
  stopping = true;
  if (live.size) console.error(`\n${signal}: stopping ${live.size} running container(s); rerun with --run-id ${runId} to finish`);
  for (const name of live) spawnSync('docker', ['kill', name], { stdio: 'ignore' });
  try { save(); } catch { /* nothing saved yet */ }
  process.exit(130);
}
process.on('SIGINT', () => stopContainers('SIGINT'));
process.on('SIGTERM', () => stopContainers('SIGTERM'));

// Retry an infrastructure error once. The failed attempt is kept next to the
// retry for inspection, and its spend still counts toward the suite budget.
// An earlier attempt's directory is kept as <rep>-attemptN (summarize.mjs
// counts it as a retry and adds its spend).
function setAside(dir) {
  if (!existsSync(dir)) return;
  let n = 1;
  while (existsSync(`${dir}-attempt${n}`)) n += 1;
  renameSync(dir, `${dir}-attempt${n}`);
}

async function runWithRetry(key, rep) {
  const dir = path.join(runRoot, 'cases', key, `r${rep}`);
  setAside(dir); // a resumed repetition whose earlier attempt failed
  const first = await runOne(key, rep);
  if (first.status !== 'ERROR' || !first.retryable) return first;
  setAside(dir);
  const second = await runOne(key, rep);
  // A killed first attempt has unknown spend; that stays visible after the retry.
  return { ...second, costUsd: (second.costUsd ?? 0) + (first.costUsd ?? 0), costUnknown: Boolean(first.costUnknown || second.costUnknown), retried: first.error };
}

// Simple worker pool: runs are independent (separate fixture copies and containers).
// Stops starting new runs once recorded spend passes the suite budget; runs
// already in flight finish and are kept.
async function pool(jobs, n) {
  const results = [];
  let next = 0;
  const spent = () => results.reduce((s, r) => s + (r.costUnknown ? cfg.budgetUsd : (r.costUsd ?? 0)), 0);
  await Promise.all(Array.from({ length: Math.min(n, jobs.length) }, async () => {
    while (next < jobs.length) {
      if (spent() > cfg.suiteBudgetUsd) { const { key, rep } = jobs[next]; results.push({ key, rep, status: 'SKIPPED', error: 'suite budget reached' }); next += 1; continue; }
      const { key, rep, run } = jobs[next++];
      try { results.push(await run()); } catch (e) { results.push({ key, rep, status: 'ERROR', error: e.message }); }
    }
  }));
  return results;
}

if (!cfg.cases.length && !notRun.length) throw new Error('--cases, --role, or --all is required');
mkdirSync(runRoot, { recursive: true });
// Record the client version that actually runs: the container's when executing.
const versions = {};
try {
  versions.claude = cfg.execute
    ? execFileSync('docker', ['run', '--rm', cfg.image, 'claude', '--version'], { encoding: 'utf8' }).trim()
    : `${execFileSync('claude', ['--version'], { encoding: 'utf8' }).trim()} (host; dry run)`;
} catch { versions.claude = 'unknown'; }
if (cfg.execute) {
  try { versions.image = execFileSync('docker', ['image', 'inspect', '--format', '{{.Id}}', cfg.image], { encoding: 'utf8' }).trim(); } catch { versions.image = 'unknown'; }
}
// Resume: re-running with the same --run-id keeps every repetition that was
// graded (verdicts.json) or hit the time limit (TIMEOUT, not retried by
// design), with its earlier result, so a finished run is never paid for
// twice. Any other repetition (an infrastructure error, such as an API spend
// limit, or one never started) runs again, its earlier attempt kept.
const resultsFile = path.join(runRoot, 'results.json');
const earlier = existsSync(resultsFile) ? JSON.parse(readFileSync(resultsFile, 'utf8')) : [];
const done = (key, rep) => {
  if (!cfg.execute) return false;
  const d = path.join(runRoot, 'cases', key, `r${rep}`);
  if (existsSync(path.join(d, 'verdicts.json'))) return true;
  const u = path.join(d, 'usage.json');
  return existsSync(u) && JSON.parse(readFileSync(u, 'utf8')).exitCode === 124;
};
const kept = earlier.filter((r) => r.rep && done(r.key, r.rep));
if (existsSync(path.join(runRoot, 'run.json')) && kept.length) console.log(`resuming ${runId}: ${kept.length} runs already done`);
else writeFileSync(path.join(runRoot, 'run.json'), JSON.stringify({ runId, commit, ...cfg, versions, startedAt: new Date().toISOString() }, null, 2));
const jobs = cfg.cases.flatMap((key) => Array.from({ length: cfg.reps }, (_, r) => ({ key, rep: r + 1, run: () => runWithRetry(key, r + 1) })))
  .filter((j) => !done(j.key, j.rep));
// results.json is rewritten after every run, so an interruption loses nothing finished.
const finished = [...kept];
const save = () => writeFileSync(resultsFile, JSON.stringify([...finished, ...notRun].map((r) => omit(r, 'verdicts')), null, 2));
// A job that throws is recorded as an infrastructure ERROR, like the pool does.
for (const j of jobs) {
  const run = j.run;
  j.run = async () => {
    let r;
    try { r = await run(); } catch (e) { r = { key: j.key, rep: j.rep, status: 'ERROR', error: e.message }; }
    finished.push(r); save(); return r;
  };
}
await pool(jobs, cfg.concurrency);
save();
const results = [...finished, ...notRun];
console.log(`${results.length - notRun.length} runs; ${results.filter((r) => r.status === 'ERROR').length} errors; ${notRun.length} not run (deferred or no fixture yet); $${results.reduce((s, r) => s + (r.costUsd ?? 0), 0).toFixed(2)} recorded; output in ${runRoot}`);
// Non-zero only when a run errored; deferred cases and missing fixtures are reported, not errors.
process.exit(results.some((r) => r.status === 'ERROR') ? 1 : 0);
