// The reference evals' graders' runner (evals/README.md, "How runs are
// graded"). Each case has a folder no run ever sees,
// evals/references/graders/<case>/, holding:
//   grader.json  for a task:
//                  "label"      its short name in the summary, such as "D1"
//                  "reference"  the reference it is about, as a path under
//                               skills/ at v0.15.0
//                  "checks"     [{ id, tier, text }], tier "outcome",
//                               "reference", or "control"; "kind": "share"
//                               makes the grader report a "value" from 0 to
//                               1 (the share of mutants caught) instead of a
//                               verdict, and the check PASSes only at 1;
//                               "atStart": "pass" marks a check the task
//                               passes by changing nothing (Doc2's "no
//                               document changes"), so the starting project
//                               passes it (check-graders.mjs)
//                  "judge"      { task, include, items }: what the blinded
//                               judge grades (judge.mjs): a task statement
//                               for it, globs of files under .standards/ it
//                               also sees when changed (a design record), and
//                               items [{ id, tier, text }]
//                  "rules"      [{ check, file, text }] for read detection,
//                               where text is an exact passage of the file
//                               that states the rule (reads.mjs finds it in
//                               each version's copy of the file)
//                  "solutions"  [{ patch, kind: "good" }, { patch, kind:
//                               "bad", fails: [ids] }]: known solutions, as
//                               patches in this folder (check-graders.mjs)
//                  "leakGuard"  strings the starting project must not hold
//                  "timeoutSec" for grade.sh (default 600)
//                for a trigger case, only "trigger": { avoid, read }: the
//                references the role must not read, and those it must
//   grade.sh     optional: runs in the runner image on a copy of the finished
//                project (with .git) as the working directory, with no network,
//                as the runner user, the grader folder read-only at
//                /opt/grader. Its last line of this form is its result:
//                GRADER_RESULT {"checks": [{"id": "...", "verdict": "PASS", "detail": "..."}]}
//                It gives each command it runs on the project a time limit
//                well under timeoutSec (timeout 120 pytest ...), so a project
//                that hangs FAILs those checks; when timeoutSec itself runs out,
//                the grader never finished, and its checks are ERROR.
//   host.mjs     optional: export async function grade({ projectDir }), which
//                returns { checks: [...] } the same way. It runs on the host,
//                so it only reads and parses files (YAML, OpenAPI, TOML) and
//                never runs anything from the project.
// Each listed check gets one verdict, PASS or FAIL (a share check: one value),
// from one of the two. A check with none, two, or another value is ERROR. A
// folder with no checks (judge items only, or a trigger case) runs nothing
// here. The finished project is
// code the model wrote, so it runs only in a container. Graders read project
// paths only: never .claude/, .agents/, or .standards/, except a record they
// read by its path, so version A's reference text never reaches them.
//
//   node graders.mjs <run-dir> [...]     writes post-checks.json into each run dir
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { EVALS_ROOT, IMAGE, REPO_ROOT } from '../lib/config.mjs';
import { prepareRuntime, imageFor } from '../lib/runtime.mjs';
import { HARNESS_EXITS, dockerAvailable } from '../lib/selfcheck.mjs';
import { BASE_COMMIT } from './build-b.mjs';

export const GRADERS_ROOT = path.join(EVALS_ROOT, 'references', 'graders');
export const TIERS = new Set(['outcome', 'reference', 'control']);
const RESULT = 'GRADER_RESULT ';

// A shipped reference at v0.15.0, as grader.json names one.
const REFERENCE = /^skills\/[\w-]+\/references\/[\w.-]+\.md$/;
const shipped = (p) => typeof p === 'string' && REFERENCE.test(p)
  && spawnSync('git', ['cat-file', '-e', `${BASE_COMMIT}:${p}`], { cwd: REPO_ROOT }).status === 0;

// A case's grader folder: its manifest, which parts it has, and any problems.
export function loadGrader(dir) {
  const file = path.join(dir, 'grader.json');
  if (!existsSync(file)) return { dir, problems: [`${path.relative(REPO_ROOT, dir)} has no grader.json`] };
  let manifest;
  try { manifest = JSON.parse(readFileSync(file, 'utf8')); } catch (error) { return { dir, problems: [`grader.json: ${error.message}`] }; }
  const problems = [];
  const list = (v) => (Array.isArray(v) ? v : []);
  const checks = list(manifest.checks);
  const items = list(manifest.judge?.items);
  if (manifest.trigger) {
    // A trigger case is graded by read detection alone.
    const { avoid, read } = manifest.trigger;
    if (![avoid, read].every((x) => x === undefined || (Array.isArray(x) && x.every(shipped))) || !(list(avoid).length + list(read).length)) {
      problems.push('trigger: avoid and read must list references shipped in v0.15.0 (skills/<role>/references/<name>.md), at least one in all');
    }
    if (checks.length || items.length) problems.push('a trigger case has no checks or judge items');
    return { dir, manifest, kind: 'trigger', container: false, host: false, problems };
  }
  if (!checks.length && !items.length) problems.push('grader.json lists no checks and no judge items');
  if (![...checks, ...items].some((c) => c?.tier === 'outcome')) problems.push('a task needs at least one outcome check or judge item: they make its score');
  if (manifest.checks !== undefined && !Array.isArray(manifest.checks)) problems.push('checks must be a list');
  if (!shipped(manifest.reference)) problems.push(`reference ${JSON.stringify(manifest.reference)}: name a reference shipped in v0.15.0 (skills/<role>/references/<name>.md)`);
  const ids = new Set();
  for (const [what, c] of [...checks.map((x) => ['check', x]), ...items.map((x) => ['judge item', x])]) {
    if (typeof c.id !== 'string' || !/^[\w.-]+$/.test(c.id)) problems.push(`${what} id ${JSON.stringify(c.id)}: use letters, digits, dots, and dashes`);
    else if (ids.has(c.id)) problems.push(`id ${c.id} is listed twice`);
    ids.add(c.id);
    if (!TIERS.has(c.tier)) problems.push(`${what} ${c.id}: tier must be outcome, reference, or control`);
    if (typeof c.text !== 'string' || !c.text.trim()) problems.push(`${what} ${c.id}: give it a text`);
    if (what === 'check' && c.kind !== undefined && c.kind !== 'share') problems.push(`check ${c.id}: kind can only be "share"`);
    if (what === 'judge item' && c.kind !== undefined) problems.push(`judge item ${c.id}: a judge item has no kind`);
    if (c.atStart !== undefined && c.atStart !== 'pass') problems.push(`${what} ${c.id}: atStart can only be "pass"`);
  }
  if (manifest.judge !== undefined) {
    const { task, include } = manifest.judge;
    if (items.length && (typeof task !== 'string' || !task.trim())) problems.push('judge: give the judge a task statement');
    if (include !== undefined && !(Array.isArray(include) && include.every((g) => typeof g === 'string' && g))) problems.push('judge: include must list globs');
  }
  for (const r of list(manifest.rules)) {
    if (!ids.has(r?.check)) problems.push(`rule ${JSON.stringify(r?.check)}: name one of the checks or judge items`);
    if (typeof r?.file !== 'string' || !/^skills\/[\w-]+\/[\w./-]+\.md$/.test(r.file) || typeof r.text !== 'string' || !r.text.trim()) problems.push(`rule ${r?.check}: give the framework file (skills/...) and the exact text that states the rule`);
  }
  for (const s of list(manifest.solutions)) {
    if (typeof s?.patch !== 'string' || !existsSync(path.join(dir, s.patch))) problems.push(`solution ${JSON.stringify(s?.patch)}: no such patch in the grader folder`);
    if (s?.kind !== 'good' && s?.kind !== 'bad') problems.push(`solution ${s?.patch}: kind must be good or bad`);
    if (s?.kind === 'bad' && !(Array.isArray(s.fails) && s.fails.length && s.fails.every((id) => ids.has(id)))) problems.push(`solution ${s?.patch}: a bad solution lists the checks or judge items it fails`);
    if (s?.kind === 'good' && s.fails !== undefined) problems.push(`solution ${s?.patch}: a good solution fails nothing`);
  }
  const kinds = list(manifest.solutions).map((x) => x?.kind);
  if (!kinds.includes('good') || !kinds.includes('bad')) problems.push('solutions: list at least one known good and one known bad solution (check-graders.mjs)');
  if (manifest.leakGuard !== undefined && !(Array.isArray(manifest.leakGuard) && manifest.leakGuard.every((x) => typeof x === 'string' && x))) problems.push('leakGuard must list strings');
  const container = existsSync(path.join(dir, 'grade.sh'));
  const host = existsSync(path.join(dir, 'host.mjs'));
  if (checks.length && !container && !host) problems.push('the folder has checks but neither grade.sh nor host.mjs');
  return { dir, manifest, kind: 'task', container, host, problems };
}

// A grader's result: its last GRADER_RESULT line.
export function parseGraderOutput(output) {
  const line = output.split('\n').reverse().find((l) => l.startsWith(RESULT));
  if (!line) return { error: 'printed no GRADER_RESULT line' };
  try {
    const r = JSON.parse(line.slice(RESULT.length));
    return Array.isArray(r.checks) ? { checks: r.checks } : { error: 'GRADER_RESULT has no checks list' };
  } catch (error) {
    return { error: `GRADER_RESULT is not JSON: ${error.message}` };
  }
}

// One verdict for each listed check, from the parts that ran:
// parts = [{ source: 'container' | 'host', checks?, error? }].
export function mergeVerdicts(manifest, parts) {
  const listed = new Set((manifest.checks ?? []).map((c) => c.id));
  const problems = parts.filter((p) => p.error).map((p) => `${p.source}: ${p.error}`);
  const got = new Map();
  for (const p of parts) {
    for (const c of p.checks ?? []) {
      if (!listed.has(c.id)) problems.push(`${p.source} gave a verdict for ${c.id}, which grader.json does not list`);
      else got.set(c.id, [...(got.get(c.id) ?? []), { ...c, source: p.source }]);
    }
  }
  const checks = (manifest.checks ?? []).map((m) => {
    const v = got.get(m.id) ?? [];
    const base = { id: m.id, tier: m.tier, text: m.text, ...(m.kind ? { kind: m.kind } : {}) };
    if (v.length > 1) return { ...base, verdict: 'ERROR', detail: `${v.length} verdicts (${v.map((x) => x.source).join(', ')})` };
    if (!v.length) return { ...base, verdict: 'ERROR', detail: problems.length ? problems.join('; ') : 'no grader gave a verdict' };
    if (m.kind === 'share') {
      // A share counts with its value; it PASSes only when everything was caught.
      const { value } = v[0];
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) return { ...base, verdict: 'ERROR', detail: `value ${JSON.stringify(value)} from ${v[0].source}: a share is a number from 0 to 1` };
      return { ...base, verdict: value === 1 ? 'PASS' : 'FAIL', value, detail: String(v[0].detail ?? ''), source: v[0].source };
    }
    if (v[0].verdict !== 'PASS' && v[0].verdict !== 'FAIL') return { ...base, verdict: 'ERROR', detail: `verdict ${JSON.stringify(v[0].verdict)} from ${v[0].source}` };
    return { ...base, verdict: v[0].verdict, detail: String(v[0].detail ?? ''), source: v[0].source };
  });
  return { checks, problems };
}

// `docker run` without blocking, so graders can run side by side. Only the
// last 4 MB of each stream is kept: the result line comes last.
const KEEP = 4 << 20;
function dockerRun(args) {
  return new Promise((resolve) => {
    const child = spawn('docker', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const out = { stdout: '', stderr: '' };
    for (const s of ['stdout', 'stderr']) {
      child[s].setEncoding('utf8');
      child[s].on('data', (d) => { out[s] += d; if (out[s].length > 2 * KEEP) out[s] = out[s].slice(-KEEP); });
    }
    child.on('error', (error) => resolve({ status: null, stdout: out.stdout, stderr: `${out.stderr}${error.message}` }));
    child.on('close', (status) => resolve({ status, ...out }));
  });
}

// grade.sh in the runner image, on a throwaway copy of the project, with no
// network. Only the run's project path and image carry over from its runtime
// block: no hidden commands, unreadable files, or CLI shim. `docker` is
// replaceable (it may return its result or a promise of it), so the self-test
// needs no Docker.
export async function runContainer({ projectDir, graderDir, runtime = {}, timeoutSec = 600, image = IMAGE, docker = dockerRun }) {
  const copy = mkdtempSync(path.join(os.tmpdir(), 'grader-'));
  const evalDir = `${copy}-eval`;
  try {
    execFileSync('cp', ['-a', `${projectDir}/.`, copy]);
    const projectRoot = runtime.projectPath ?? '/work';
    prepareRuntime({ runtime: { projectPath: projectRoot }, specDir: null, evalDir, projectRoot, framework: null });
    // --init: Ctrl+C reaches grade.sh instead of an entry script that ignores it.
    const r = await docker(['run', '--rm', '--init', '--network', 'none', '--cpus', '2', '--memory', '4g',
      '-v', `${copy}:/mnt/project`, '-v', `${evalDir}:/opt/eval:ro`, '-v', `${graderDir}:/opt/grader:ro`,
      imageFor(runtime, image), 'sh', '/opt/eval/entry.sh', String(Math.ceil(timeoutSec / 60)), 'sh', '/opt/grader/grade.sh']);
    return { exit: r.status, output: `${r.stdout ?? ''}${r.stderr ?? ''}` };
  } finally {
    rmSync(copy, { recursive: true, force: true });
    rmSync(evalDir, { recursive: true, force: true });
  }
}

// Every part of one case's grader on one finished project.
export async function runGraders({ graderDir, projectDir, runtime = {}, image = IMAGE, docker = null }) {
  const g = loadGrader(graderDir);
  if (!g.manifest) return { checks: [], problems: g.problems };
  if (!(g.manifest.checks ?? []).length) return { checks: [], problems: g.problems };
  const parts = [];
  const out = {};
  if (g.container) {
    const started = Date.now();
    const img = imageFor(runtime, image);
    if (!docker && !dockerAvailable(img)) parts.push({ source: 'container', error: `Docker or ${img} not available` });
    else {
      const r = await runContainer({ projectDir, graderDir, runtime, timeoutSec: g.manifest.timeoutSec ?? 600, image, ...(docker ? { docker } : {}) });
      out.container = { exit: r.exit, ms: Date.now() - started, tail: r.output.slice(-2000) };
      // A harness exit (copy, setup, timeout, docker) means the grader never
      // finished; any other exit still has its GRADER_RESULT line.
      if (r.exit === null || HARNESS_EXITS.has(r.exit)) parts.push({ source: 'container', error: `the grader could not run (exit ${r.exit})` });
      else parts.push({ source: 'container', ...parseGraderOutput(r.output) });
    }
  }
  if (g.host) {
    const started = Date.now();
    try {
      const mod = await import(pathToFileURL(path.join(graderDir, 'host.mjs')).href);
      const r = await mod.grade({ projectDir });
      parts.push(Array.isArray(r?.checks) ? { source: 'host', checks: r.checks } : { source: 'host', error: 'grade() returned no checks list' });
    } catch (error) {
      parts.push({ source: 'host', error: `host.mjs: ${error.message}` });
    }
    out.host = { ms: Date.now() - started };
  }
  const merged = mergeVerdicts(g.manifest, parts);
  return { checks: merged.checks, problems: [...g.problems, ...merged.problems], ...out };
}

// A hash of every file in a grader folder, recorded with each grade, so a
// changed grader grades its runs again.
export function graderHash(dir) {
  const h = createHash('sha256');
  const walk = (rel) => {
    for (const e of readdirSync(path.join(dir, rel), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.name === '.DS_Store') continue;
      if (e.isDirectory()) walk(r);
      else h.update(`${r}\0`).update(readFileSync(path.join(dir, r))).update('\0');
    }
  };
  if (existsSync(dir)) walk('');
  return h.digest('hex').slice(0, 16);
}

// post-checks.json for one run: the finished project from after.tar.gz (with
// .git), or, when the tarball was not kept (an API key reached git history),
// the .git-free copy in after/.
export async function gradeRun(runDir, { graderDir = null, ...opts } = {}) {
  const run = JSON.parse(readFileSync(path.join(runDir, 'run.json'), 'utf8'));
  const dir = graderDir ?? path.join(GRADERS_ROOT, run.case);
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'grader-project-'));
  try {
    let project;
    if (existsSync(path.join(runDir, 'after.tar.gz'))) {
      execFileSync('tar', ['-xzf', path.join(runDir, 'after.tar.gz'), '-C', tmp]);
      project = 'after.tar.gz';
    } else if (existsSync(path.join(runDir, 'after'))) {
      execFileSync('cp', ['-a', `${path.join(runDir, 'after')}/.`, tmp]);
      project = 'after/ (no .git: the tarball was not kept)';
    } else {
      throw new Error(`${runDir} has no finished project (after.tar.gz or after/); was it a dry run?`);
    }
    const r = await runGraders({ graderDir: dir, projectDir: tmp, runtime: run.runtime ?? {}, ...opts });
    const result = { case: run.case, grader: path.relative(REPO_ROOT, dir), graderHash: graderHash(dir), project, ...r };
    writeFileSync(path.join(runDir, 'post-checks.json'), JSON.stringify(result, null, 2));
    return result;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const dir of process.argv.slice(2)) {
    try {
      const r = await gradeRun(dir);
      const count = (v) => r.checks.filter((c) => c.verdict === v).length;
      console.log(`${dir}: ${count('PASS')} pass, ${count('FAIL')} fail, ${count('ERROR')} error${r.problems.length ? `; ${r.problems.join('; ')}` : ''}`);
    } catch (error) {
      console.error(`${dir}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
