#!/usr/bin/env node
// One entry point for the STANDARDS skills eval harness (evals/README.md).
//
//   pnpm evals <command> [options]          (or: node evals/cli.mjs <command> ...)
//
// Nothing billable happens without --execute. Without it, `run` builds the
// fixtures and prints the docker commands it would run, and the commands that
// call the Claude API print what they would send and how many calls that is.
// With --execute, the CLI sets EVAL_ALLOW_MODEL=1 for the harness script it
// starts; the scripts refuse every model call without it.
//
// Settings come from the root .env (see .template.env and lib/config.mjs).
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CLAUDE_CODE_VERSION, DEFAULT_COMMIT, EFFORT, ENV_FILE, FIXTURES_ROOT, IMAGE, BROWSER_IMAGE, JUDGE_EFFORT, JUDGE_MODEL, MODEL, PRICES,
  REVIEW_MODEL, GEN_MODEL, RUNS_ROOT, SECOND_JUDGE_EFFORT, SECOND_JUDGE_MODEL, apiKeyProblems, apiKeySource, envFileWarnings, userGitEnv,
} from './harness/lib/config.mjs';

const EVALS = path.dirname(fileURLToPath(import.meta.url));
const HARNESS = path.join(EVALS, 'harness');
const ROLES = ['architect', 'auditor', 'developer', 'documenter', 'navigator', 'reviewer', 'scoper', 'synchronizer', 'tester'];

const USAGE = `STANDARDS skills evals (evals/README.md)

  pnpm evals check                      check Node, git, Docker, the runner images, the API key, fixtures
  pnpm evals image build|check          build or check the runner images (Claude Code ${CLAUDE_CODE_VERSION})

  pnpm evals fixtures migrate [--jobs 4]  carry them to ${DEFAULT_COMMIT} (no model; gates 1 and 2)
  pnpm evals fixtures status            per role: ready, needing review, needing regeneration, missing
  pnpm evals fixtures generate --needed [--execute]       write fixtures for cases that need one (${GEN_MODEL})
  pnpm evals fixtures review --needed [--execute]         review fixtures that passed gates 1-2 (${REVIEW_MODEL})
  pnpm evals fixtures review --carried-over [--execute]   review carried-over fixtures again at ${DEFAULT_COMMIT}
  pnpm evals fixtures flags             what needs your decision
  pnpm evals fixtures decide <target> run|na|defer|fixed|regenerate|exempt [...]

  pnpm evals run (--all | --role <r> | --cases a-1,b-2) [--reps N] [--execute]
                                        run ${MODEL} (effort ${EFFORT}) in Docker; exact checks grade
  pnpm evals judge <run> [--mode sync|batch] [--execute]   ${JUDGE_MODEL} (effort ${JUDGE_EFFORT}) grades the rest
  pnpm evals judge-checks <run> [--execute]   judge reliability checks (known wrong answers, stability, second judge)
  pnpm evals report <run> [<run> ...]   summary.md and summary.json
  pnpm evals pipeline (--all | --role <r> | --cases ...) --execute    run, judge, judge checks, report
  pnpm evals preflight --execute        one small call per API model: judges, fixture writer, reviewer
  pnpm evals spend [<run> ...]          measured API spend
  pnpm evals selftest                   the harness's own tests (no model, no Docker)

<run> is a run id under evals/runs/ or a path.`;

const argv = process.argv.slice(2);
const execute = argv.includes('--execute');
const rest = (from) => argv.slice(from).filter((a) => a !== '--execute');
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));

// Run one harness script, inheriting the terminal. --execute alone switches
// model calls on. Returns the exit code.
function script(name, args, { allowModel = false } = {}) {
  const env = { ...process.env };
  if (allowModel) env.EVAL_ALLOW_MODEL = '1';
  else delete env.EVAL_ALLOW_MODEL;
  return spawnSync(process.execPath, [path.join(HARNESS, name), ...args], { stdio: 'inherit', env }).status ?? 1;
}

// A paid command: the key must be usable, and the settings are shown first.
function requireKey() {
  const problems = apiKeyProblems();
  if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
}
function banner(what) {
  console.log(`${what}\n  framework ${DEFAULT_COMMIT} | under test ${MODEL} (${EFFORT}) via Claude Code ${CLAUDE_CODE_VERSION}`
    + ` | judge ${JUDGE_MODEL} (${JUDGE_EFFORT}) | second judge ${SECOND_JUDGE_MODEL}${SECOND_JUDGE_MODEL === 'none' ? '' : ` (${SECOND_JUDGE_EFFORT})`}`
    + ` | API key from ${apiKeySource() ?? 'nowhere'}\n`);
}

// What one call costs, from the average token use measured in the v0.8.0
// evaluation's spend log, priced for the model now configured. The judge row
// is the main judge's sync profile (cached evidence shared across a run).
const PROFILES = {
  generate: { in: 20487, write: 19590, read: 109112, out: 34804 },
  repair: { in: 62730, write: 13517, read: 114649, out: 17211, share: 49 / 372 },
  review: { in: 32958, write: 21107, read: 101146, out: 4107 },
  judge: { in: 177, write: 15796, read: 24965, out: 442 },
};
function estimate(kind, model) {
  const p = PRICES[model];
  const t = PROFILES[kind];
  if (!p) return null;
  return (t.in * p.in + t.write * p.in * 1.25 + t.read * p.read + t.out * p.out) / 1e6;
}
const usd = (x) => (x === null ? 'unknown (no price for this model in lib/config.mjs)' : `$${x.toFixed(2)}`);
const frameworkSha = () => spawnSync('git', ['rev-parse', DEFAULT_COMMIT], { encoding: 'utf8' }).stdout.trim();
// A new run id, printed with how to resume, so an interrupted paid run can be
// finished without paying again for the cases that completed.
function newRunId(role) {
  const sha7 = frameworkSha().slice(0, 7);
  return `${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}Z-${sha7}-${MODEL}${role ? `-${role}` : ''}`;
}

// The model a run command will test (--model, else EVAL_MODEL). The judge must
// not grade its own model's runs: judge-run.mjs refuses them.
const modelUnderTest = () => valued(['--model'])[1] ?? MODEL;
const judgeIsModel = () => modelUnderTest() === JUDGE_MODEL;

const runDir = (arg) => {
  if (!arg) { console.error('name a run: an id under evals/runs/ or a path'); process.exit(1); }
  const d = existsSync(path.join(RUNS_ROOT, arg)) ? path.join(RUNS_ROOT, arg) : path.resolve(arg);
  if (!existsSync(path.join(d, 'run.json'))) { console.error(`not a run directory: ${d}`); process.exit(1); }
  return d;
};

// Fixture state for every case and shared base (lib/readiness.mjs, the same
// rules run.mjs enforces): what `fixtures status` reports and what
// `generate --needed` and `review --needed` act on.
async function fixtureTable() {
  const { loadRole } = await import('./harness/lib/cases.mjs');
  const { baseState, caseState } = await import('./harness/lib/readiness.mjs');
  const { BASES_DIR } = await import('./harness/build-fixture.mjs');
  const sha = frameworkSha();
  const bases = existsSync(BASES_DIR) ? readdirSync(BASES_DIR).filter((n) => existsSync(path.join(BASES_DIR, n, 'spec.json'))).sort() : [];
  return [
    ...bases.map((n) => ({ key: `base:${n}`, role: '_bases', ...baseState(n, sha), spec: readJson(path.join(BASES_DIR, n, 'spec.json')) })),
    ...ROLES.flatMap((role) => loadRole(role).map((c) => ({ key: c.key, role, ...caseState(c, sha) }))),
  ].map((r) => ({ ...r, carriedOver: r.spec?.reviewedBy?.carriedOver?.commit === sha }));
}

async function fixtures(sub) {
  if (sub === 'migrate') return script('migrate-fixtures.mjs', ['migrate', ...rest(2)]);
  if (sub === 'flags') return script('flags.mjs', rest(2));
  if (sub === 'decide') return script('decide.mjs', rest(2));
  if (sub === 'validate') {
    const { targetDir } = await import('./harness/generate-fixture.mjs');
    return script('validate-fixture.mjs', rest(2).map((t) => (t.startsWith('--') || existsSync(t) ? t : targetDir(t))));
  }
  const table = await fixtureTable();
  if (sub === 'status') {
    const states = ['ready', 'migrate', 'review', 'base', 'regenerate', 'stale', 'missing', 'draft', 'flagged', 'deferred'];
    console.log(`Fixtures in ${FIXTURES_ROOT} for ${DEFAULT_COMMIT}\n`);
    console.log(['role'.padEnd(13), ...states.map((s) => s.padStart(11))].join(''));
    for (const role of [...ROLES, '_bases', null]) {
      const rows = table.filter((r) => (role === null ? r.role !== '_bases' : r.role === role));
      console.log([(role === null ? 'all cases' : role === '_bases' ? 'shared bases' : role).padEnd(13), ...states.map((s) => String(rows.filter((r) => r.state === s).length).padStart(11))].join(''));
    }
    const carried = table.filter((r) => r.state === 'ready' && r.carriedOver && r.role !== '_bases').length;
    console.log([`\nready       can run (${carried} of them carried over from a review at an earlier release)`,
      'migrate     reviewed for another framework commit, or migrated without its selfChecks: pnpm evals fixtures migrate',
      'review      waiting for its gate-3 review: pnpm evals fixtures review --needed',
      'base        a shared base under it is not ready (see the shared bases row)',
      'regenerate  failed gates at this commit; stale: the case changed; missing: no fixture yet',
      '            all three: pnpm evals fixtures generate --needed',
      'draft, flagged  need your decision: pnpm evals fixtures flags'].join('\n'));
    const why = table.filter((r) => !['ready', 'missing', 'deferred'].includes(r.state));
    if (why.length && argv.includes('--why')) console.log(`\n${why.map((r) => `${r.key}: ${r.state}: ${r.why}`).join('\n')}`);
    else if (why.length) console.log('\nAdd --why to list the reason for each fixture that is not ready.');
    return 0;
  }
  // Targets named on the command line: case keys or base:<name>, not option values.
  const takesValue = new Set(['--concurrency', '--commit', '--notes']);
  const named = rest(2).filter((a, i, all) => !a.startsWith('--') && !takesValue.has(all[i - 1]));
  if (sub === 'generate') {
    // --needed: every case with no fixture, a changed case, or a failed
    // migration, and any base that needs regenerating. Those specs exist, so
    // they are replaced (--force). Named targets are never forced unless you
    // pass --force: generate-fixture.mjs then skips finished targets and
    // regenerations whose --notes were already applied.
    const needed = argv.includes('--needed');
    const targets = needed ? table.filter((r) => ['missing', 'regenerate', 'stale'].includes(r.state)).map((r) => r.key) : named;
    if (!targets.length) { console.log('nothing to generate'); return 0; }
    const force = argv.includes('--force') || needed;
    banner(`${targets.length} fixtures to generate with ${GEN_MODEL}: ${targets.join(', ')}`);
    // --dry writes each first request to the fixture's gen/ folder and calls nothing.
    if (!execute && !argv.includes('--dry')) {
      const g = estimate('generate', GEN_MODEL);
      const r = estimate('repair', GEN_MODEL);
      const each = g === null || r === null ? null : g + r * PROFILES.repair.share;
      const rv = estimate('review', REVIEW_MODEL);
      console.log(`Estimate: ${usd(each)} per fixture to write (${GEN_MODEL}), plus ${usd(rv)} to review it (${REVIEW_MODEL}); ${each === null ? '' : `about $${(targets.length * each).toFixed(0)} to write all ${targets.length}. `}Add --execute to generate (or --dry to see the requests).`);
      return 0;
    }
    if (execute) requireKey();
    return script('generate-fixture.mjs', [...targets, ...(force ? ['--force'] : []), ...flags(['--dry', '--no-self-checks']), ...valued(['--concurrency', '--commit', '--notes'])], { allowModel: execute });
  }
  if (sub === 'review') {
    // Each target with whether review-fixture.mjs must be told --force: a
    // spec it would otherwise skip because it holds an earlier review.
    let picked = named.map((t) => ({ key: t, force: argv.includes('--force') }));
    if (argv.includes('--needed')) picked = table.filter((r) => r.state === 'review').map((r) => ({ key: r.key, force: r.spec?.status !== 'gated' }));
    if (argv.includes('--carried-over')) picked = table.filter((r) => r.carriedOver).map((r) => ({ key: r.key, force: true }));
    // Bases first: a case is reviewed only on reviewed bases.
    picked.sort((a, b) => Number(!a.key.startsWith('base:')) - Number(!b.key.startsWith('base:')));
    if (!picked.length) { console.log('nothing to review'); return 0; }
    banner(`${picked.length} fixtures to review with ${REVIEW_MODEL}`);
    if (!execute && !argv.includes('--dry')) { console.log(`${picked.map((t) => t.key).join(', ')}\nEstimate: ${usd(estimate('review', REVIEW_MODEL))} per review (${REVIEW_MODEL}). Add --execute to review (or --dry to see the requests).`); return 0; }
    if (execute) requireKey();
    const rest2 = [...flags(['--dry']), ...valued(['--concurrency', '--commit'])];
    let code = 0;
    for (const force of [false, true]) {
      const group = picked.filter((t) => t.force === force).map((t) => t.key);
      if (group.length) code = script('review-fixture.mjs', [...group, ...(force ? ['--force'] : []), ...rest2], { allowModel: execute }) || code;
    }
    return code;
  }
  console.error(USAGE);
  return 1;
}

// Options passed through as given: ones that take a value, and switches.
function valued(names) {
  return names.flatMap((n) => { const i = argv.indexOf(n); return i >= 0 ? [n, argv[i + 1]] : []; });
}
const flags = (names) => names.filter((n) => argv.includes(n));

// The judge requests a run's grading left for the judge.
function pendingJudge(dir) {
  let n = 0;
  const cases = path.join(dir, 'cases');
  if (!existsSync(cases)) return 0;
  // Case folders only: Finder can leave a .DS_Store file here.
  for (const c of readdirSync(cases, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)) {
    for (const r of readdirSync(path.join(cases, c)).filter((x) => /^r\d+$/.test(x))) {
      const v = path.join(cases, c, r, 'verdicts.json');
      if (existsSync(v)) n += (readJson(v).assertions ?? []).filter((a) => a.verdict === 'NEEDS_JUDGE').length;
    }
  }
  return n;
}

async function checkSetup() {
  const lines = [];
  const ok = (good, what, fix = '') => lines.push(`${good ? 'ok  ' : 'FAIL'} ${what}${!good && fix ? `\n       ${fix}` : ''}`);
  const sh = (cmd, args) => spawnSync(cmd, args, { encoding: 'utf8' });
  const [major, minor] = process.versions.node.split('.').map(Number);
  ok(major > 22 || (major === 22 && minor >= 12), `Node ${process.versions.node}`, 'Node 22.12 or newer is required');
  ok(sh('git', ['rev-parse', DEFAULT_COMMIT]).status === 0, `framework ${DEFAULT_COMMIT} resolves in this checkout`, `git fetch --tags, or set EVAL_COMMIT in ${ENV_FILE}`);
  ok(existsSync(path.join(EVALS, '..', 'node_modules/@clack/prompts')), 'repository dependencies installed', 'run: pnpm install');
  let sdk = true;
  try { createRequire(path.join(EVALS, 'package.json')).resolve('@anthropic-ai/sdk'); } catch { sdk = false; }
  ok(sdk, 'Anthropic SDK installed for evals/', 'run: pnpm install');
  const docker = sh('docker', ['version', '--format', '{{.Server.Version}}']);
  ok(docker.status === 0, `Docker ${docker.status === 0 ? docker.stdout.trim() : ''}`.trim(), 'start Docker Desktop');
  for (const img of [IMAGE, BROWSER_IMAGE]) ok(docker.status === 0 && sh('docker', ['image', 'inspect', img]).status === 0, `runner image ${img}`, 'run: pnpm evals image build');
  const keyProblems = apiKeyProblems();
  ok(!keyProblems.length, `ANTHROPIC_API_KEY (from ${apiKeySource() ?? 'nowhere'})`, keyProblems.join('; '));
  for (const w of envFileWarnings()) lines.push(`note ${w}`);
  const table = existsSync(FIXTURES_ROOT) ? (await fixtureTable()).filter((r) => r.role !== '_bases') : [];
  const ready = table.filter((r) => r.state === 'ready').length;
  ok(ready > 0, `fixtures: ${ready} of ${table.length || 'all'} cases ready to run`, existsSync(FIXTURES_ROOT) ? 'see: pnpm evals fixtures status' : 'no fixtures found: they are committed under evals/fixtures/');
  const { uncommittableFixtureFiles } = await import('./harness/lib/readiness.mjs');
  const left = uncommittableFixtureFiles(userGitEnv());
  ok(!left.length, `every fixture file can be committed${left.length ? ` (${left.length} would be left out by an ignore rule)` : ''}`, `git add -f ${[...new Set(left.map((f) => path.dirname(f)))].slice(0, 5).join(' ')}${left.length > 5 ? ' ...' : ''}`);
  console.log(lines.join('\n'));
  return lines.some((l) => l.startsWith('FAIL')) ? 1 : 0;
}

async function main() {
  const [cmd, sub] = argv;
  switch (cmd) {
    case 'check': return checkSetup();
    case 'image': {
      if (sub === 'build') return script('image.mjs', ['build']) || script('image.mjs', ['build-browser']);
      if (sub === 'check') return script('image.mjs', ['check', ...rest(2)]) || script('image.mjs', ['check-browser']);
      break;
    }
    case 'fixtures': return fixtures(sub);
    case 'run': {
      banner(execute ? 'Running the model under test' : 'Dry run (add --execute to run the model)');
      if (!execute) return script('run.mjs', [...argv.slice(1)]);
      requireKey();
      if (judgeIsModel()) console.log(`Note: the model under test is the judge (${JUDGE_MODEL}). Set EVAL_JUDGE_MODEL to a different model before judging these runs.\n`);
      // A paid run always gets a known id, so an interrupted one can resume.
      const id = valued(['--run-id'])[1] ?? newRunId(valued(['--role'])[1]);
      console.log(`Run id: ${id}\nIf this stops early, run the same command with --run-id ${id} to finish only what is left.\n`);
      return script('run.mjs', [...argv.slice(1).filter((a, i, all) => a !== '--run-id' && all[i - 1] !== '--run-id'), '--run-id', id], { allowModel: true });
    }
    case 'judge': {
      const dir = runDir(sub);
      const n = pendingJudge(dir);
      banner(`${n} assertions in ${path.basename(dir)} wait for the judge`);
      if (!execute) { const e = estimate('judge', JUDGE_MODEL); console.log(`Estimate: ${usd(e)} per verdict (${JUDGE_MODEL}, from the v0.8.0 token use)${e === null ? '' : `, about $${(n * e).toFixed(0)} for these`}. Add --execute to judge.`); return 0; }
      requireKey();
      return script('judge-run.mjs', [dir, ...rest(2)], { allowModel: true });
    }
    case 'judge-checks': {
      const dir = runDir(sub);
      const label = valued(['--label'])[1] ?? path.basename(dir);
      banner(`Judge checks on ${path.basename(dir)}`);
      const args = ['--label', label, dir, ...rest(2).filter((a, i, all) => a !== '--label' && all[i - 1] !== '--label')];
      if (!execute) return script('judge-checks.mjs', [...args, '--dry']);
      requireKey();
      return script('judge-checks.mjs', args, { allowModel: true });
    }
    case 'report': {
      const dirs = argv.slice(1).filter((a) => !a.startsWith('--')).map(runDir);
      if (dirs.length === 1) return script('summarize.mjs', dirs);
      const out = valued(['--out'])[1] ?? path.join(RUNS_ROOT, `report-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}Z`);
      return script('summarize.mjs', ['--out', out, ...dirs]);
    }
    case 'pipeline': {
      if (!execute) { console.error('pipeline runs the model and the judge: add --execute (or use `run` for a dry run)'); return 1; }
      if (judgeIsModel()) { console.error(`the model under test (${JUDGE_MODEL}) is also the judge, which would grade its own runs; set EVAL_JUDGE_MODEL to a different model`); return 1; }
      requireKey();
      const id = valued(['--run-id'])[1] ?? newRunId(valued(['--role'])[1]);
      banner(`Pipeline ${id}: run, judge, checks, report`);
      console.log(`If this stops early, run the same command with --run-id ${id}: finished runs and verdicts are kept and not paid for again.\n`);
      const runArgs = [...argv.slice(1).filter((a, i, all) => a !== '--run-id' && all[i - 1] !== '--run-id'), '--run-id', id];
      const ran = script('run.mjs', runArgs, { allowModel: true });
      // A run that errored for infrastructure is retried by running the same --run-id again; the rest are judged now.
      if (ran !== 0) console.log(`\nSome runs errored (exit ${ran}); rerun \`pnpm evals run ... --run-id ${id} --execute\` later to retry only those. Judging the rest.`);
      const dir = path.join(RUNS_ROOT, id);
      if (!existsSync(dir)) return ran || 1;
      const judged = script('judge-run.mjs', [dir], { allowModel: true });
      const checked = judged === 0 ? script('judge-checks.mjs', ['--label', id, dir], { allowModel: true }) : judged;
      script('summarize.mjs', [dir]);
      console.log(`\nReport: ${path.join(dir, 'summary.md')}`);
      return ran || judged || checked;
    }
    case 'preflight': {
      banner('Judge preflight');
      if (!execute) { console.log('Sends one small request to each model the harness calls through the API: the judge, the second judge, the fixture writer, and the reviewer (a few cents). Add --execute.'); return 0; }
      requireKey();
      return script('judge-preflight.mjs', [], { allowModel: true });
    }
    case 'spend': return script('spend.mjs', argv.slice(1).map((a, i, all) => (a.startsWith('--') || all[i - 1] === '--since' ? a : runDir(a))));
    case 'selftest': return script('selftest.mjs', []);
    default: break;
  }
  console.log(USAGE);
  return cmd && !['help', '--help', '-h'].includes(cmd) ? 1 : 0;
}

process.exit(await main());
