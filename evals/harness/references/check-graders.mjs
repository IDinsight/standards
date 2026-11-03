#!/usr/bin/env node
// `pnpm evals references check-graders` (evals/README.md, "How runs are
// graded"): before the first real run, each task's grader must fail the
// starting project, pass its known good solutions, and fail its known bad
// ones exactly where they say.
//
//   node check-graders.mjs [--cases developer-901,...] [--execute]
//
// For each task, the fixture is built at v0.15.0, and its project is the
// starting point. Each solution in grader.json is a patch, applied to a copy
// of it with git apply. The code checks run on each project twice, in Docker
// with no network (graders.mjs), and the two results must match. Expected:
//   the starting project  every outcome and reference check FAILs, and a
//                         share check is 0, except a check marked atStart
//                         "pass" (the task passes it by changing nothing);
//                         control checks are only reported
//   a good solution       every check PASSes
//   a bad solution        the checks it lists FAIL, and every other one PASSes
// Leak guard: no string in grader.json's leakGuard is in the starting
// project's files, and the judge's masking (judge.mjs) changes none of the
// files the judge could see, so a mask in a request always comes from a run.
// A judge task or item that names a framework file would block every request
// for it, so that is reported even without --execute.
// With --execute (cli.mjs also sets EVAL_ALLOW_MODEL=1), the blinded judge
// grades each project once, and its items must meet the same expectations.
// Run with the reference evals' cases and fixtures (cli.mjs sets them).
// Writes evals/runs/check-graders/<time>/summary.md and summary.json, and
// records each task that passed in evals/runs/check-graders/passed.json with
// a hash of its grader folder, of its fixture build, and of the rest the
// check depends on (the fixture's grader-only facts and runtime, and the
// blinded judge's prompt, schema, model, and effort): the real runs start only
// when every task passed with the judge, as all of these are now
// (pipeline.mjs). A task that failed loses its entry; one that could not be
// graded (no Docker, a grader or judge error) keeps whatever it had. Exits 0
// when everything is as expected, 2 when something is not, 3 when something
// could not be graded.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { FRAMEWORK_PATH, buildFixture, resolveSpec } from '../build-fixture.mjs';
import { globRe } from '../grade.mjs';
import { batchId } from '../lib/anthropic.mjs';
import { IMAGE, RUNS_ROOT } from '../lib/config.mjs';
import { dockerAvailable } from '../lib/selfcheck.mjs';
import { manifest } from '../lib/snapshot.mjs';
import { sendAll } from '../judge-run.mjs';
import { BASE_COMMIT } from './build-b.mjs';
import { GRADERS_ROOT, graderHash, loadGrader, runGraders } from './graders.mjs';
import { BLIND_JUDGE, auditRequest, blindEvidence, blindRequest, changedFilesText, mask, readProjectFile } from './judge.mjs';
import { FIXTURES_DIR, referenceCases } from './plan.mjs';

const HIDDEN = /^\.(?:claude|agents|standards)\//;
// The block the installer merges into AGENTS.md and CLAUDE.md: the framework's own text.
const INSTALLED_BLOCK = /<!-- standards:start -->[\s\S]*?<!-- standards:end -->/g;
export const PASSED = path.join(RUNS_ROOT, 'check-graders', 'passed.json');

// What else a judged pass depends on, outside the grader folder and the
// fixture build: the facts the judge gets, the runtime the grader runs in, and
// the judge itself. null when the spec cannot be read.
export function checkInputsHash(specDir) {
  try {
    const spec = JSON.parse(readFileSync(path.join(specDir, 'spec.json'), 'utf8'));
    return createHash('sha256').update(JSON.stringify({ facts: spec.graderOnly ?? [], runtime: resolveSpec(specDir).runtime ?? {}, judge: BLIND_JUDGE })).digest('hex').slice(0, 16);
  } catch {
    return null;
  }
}

// What each check or judge item should give on a project.
export function expected(entry, project) {
  if (project.kind === 'start') return entry.atStart === 'pass' ? 'PASS' : entry.tier === 'control' ? null : 'FAIL';
  if (project.kind === 'good') return 'PASS';
  return project.fails.includes(entry.id) ? 'FAIL' : 'PASS';
}
// A result against its expectation: ok, miss, or error (not graded).
export function compare(entry, got, project) {
  const want = expected(entry, project);
  if (!got || !['PASS', 'FAIL', 'UNCLEAR'].includes(got.verdict)) return { id: entry.id, want, got: got?.verdict ?? 'MISSING', outcome: 'error', detail: got?.detail ?? got?.rationale ?? '' };
  // At the start, a share check must catch nothing at all.
  const ok = want === null || (got.verdict === want && !(project.kind === 'start' && entry.kind === 'share' && got.value !== 0));
  return { id: entry.id, want, got: got.verdict, ...(got.value !== undefined ? { value: got.value } : {}), outcome: ok ? 'ok' : 'miss', detail: got.detail ?? got.rationale ?? '' };
}

// Leak guard on the starting project: listed strings in any project file
// (outside the framework's), and files the judge could see that its masking
// would change (the installer's own block in AGENTS.md and CLAUDE.md aside).
export function leaks(startDir, grader) {
  const out = [];
  const include = (grader.judge?.include ?? []).map(globRe);
  for (const rel of Object.keys(manifest(startDir))) {
    if (FRAMEWORK_PATH.test(rel)) continue;
    const visible = !HIDDEN.test(rel) || include.some((r) => r.test(rel));
    if (visible && mask(rel) !== rel) out.push(`${rel}: the judge's masking would change its name`);
    // Links are listed by name only; binary files hold no prose to mask.
    if (lstatSync(path.join(startDir, rel)).isSymbolicLink()) continue;
    const buf = readFileSync(path.join(startDir, rel));
    const text = buf.toString('utf8');
    for (const s of grader.leakGuard ?? []) if (text.includes(s)) out.push(`"${s}" is in ${rel}`);
    const own = text.replace(INSTALLED_BLOCK, '');
    if (visible && !buf.includes(0) && mask(own) !== own) out.push(`${rel}: the judge's masking would change it (it names a framework file, a references/ path, or a reference)`);
  }
  return out;
}

// One task: the starting project and each solution, graded twice, and the
// judge's requests for each (sent later). `docker` replaces Docker in tests.
export async function checkTask({ key, graderDir, startDir, spec = {}, runtime = {}, docker = null, judge = false }) {
  const g = loadGrader(graderDir);
  const result = { key, projects: [], leaks: [], blocked: [], unusable: [], problems: [...g.problems], requests: [] };
  if (!g.manifest || g.kind !== 'task') { if (g.manifest) result.problems.push('not a task grader'); return result; }
  result.leaks = leaks(startDir, g.manifest);
  const entries = [...(g.manifest.checks ?? []), ...(g.manifest.judge?.items ?? [])];
  const judged = new Set((g.manifest.judge?.items ?? []).map((i) => i.id));
  const projects = [{ name: 'start', kind: 'start', dir: startDir },
    ...(g.manifest.solutions ?? []).map((s) => ({ name: s.patch, kind: s.kind, fails: s.fails ?? [], patch: path.join(graderDir, s.patch) }))];
  const before = manifest(startDir);
  for (const p of projects) {
    let dir = p.dir;
    if (p.patch) {
      dir = mkdtempSync(path.join(os.tmpdir(), 'grader-solution-'));
      cpSync(startDir, dir, { recursive: true, verbatimSymlinks: true });
      try {
        execFileSync('git', ['apply', '--whitespace=nowarn', p.patch], { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'] });
      } catch (error) {
        result.unusable.push(`${p.name} does not apply to the starting project: ${String(error.stderr ?? error.message).trim().slice(0, 300)}`);
        rmSync(dir, { recursive: true, force: true });
        continue;
      }
    }
    try {
      const first = await runGraders({ graderDir, projectDir: dir, runtime, ...(docker ? { docker } : {}) });
      const second = await runGraders({ graderDir, projectDir: dir, runtime, ...(docker ? { docker } : {}) });
      const sig = (r) => JSON.stringify(r.checks.map((c) => [c.id, c.verdict, c.value ?? null]));
      // Compared only when both runs graded every check; a run that could not
      // finish leaves it unknown (null), which is an error, not a miss.
      const graded = (r) => r.checks.every((c) => c.verdict !== 'ERROR');
      const got = new Map(first.checks.map((c) => [c.id, c]));
      result.projects.push({ name: p.name, kind: p.kind, fails: p.fails ?? [], repeatable: graded(first) && graded(second) ? sig(first) === sig(second) : null,
        checks: entries.filter((e) => !judged.has(e.id)).map((e) => compare(e, got.get(e.id), p)), problems: [...new Set([...first.problems, ...second.problems])] });
      if (judged.size) {
        const files = changedFilesText({ before, after: manifest(dir), read: readProjectFile(dir), include: g.manifest.judge.include ?? [] });
        const evidence = blindEvidence({ task: g.manifest.judge.task, facts: spec.graderOnly ?? [], files });
        for (const item of g.manifest.judge.items) {
          const request = blindRequest(evidence, item);
          const blocked = auditRequest(request);
          const note = `judge item ${item.id}: its request names ${blocked.join(', ')}; the rubric must not name a framework file`;
          if (blocked.length && !result.blocked.includes(note)) result.blocked.push(note);
          if (judge) result.requests.push({ project: p.name, item, request, blocked, customId: batchId(key, p.name, item.id) });
        }
      }
    } finally {
      if (p.patch) rmSync(dir, { recursive: true, force: true });
    }
  }
  return result;
}

// The judge's verdicts on every project, then each item against its expectation.
export async function judgeTasks(results, { outDir, concurrency = 4 }) {
  const all = results.flatMap((r) => r.requests.map((q) => ({ ...q, key: r.key })));
  if (new Set(all.map((q) => q.customId)).size !== all.length) throw new Error('judge request ids collide; shorten the patch names or item ids');
  mkdirSync(path.join(outDir, 'judge'), { recursive: true });
  for (const q of all) writeFileSync(path.join(outDir, 'judge', `${q.customId}.json`), JSON.stringify(q.request, null, 2));
  const got = new Map(all.filter((q) => q.blocked.length).map((q) => [q.customId, { verdict: 'ERROR', rationale: `blocked: the request names ${q.blocked.join(', ')}` }]));
  const fresh = await sendAll(all.filter((q) => !q.blocked.length).map((q) => ({ customId: q.customId, request: q.request })), { concurrency, purpose: 'references-check-graders' });
  for (const [id, v] of fresh) got.set(id, v);
  writeFileSync(path.join(outDir, 'judge-verdicts.json'), JSON.stringify(Object.fromEntries(got), null, 2));
  for (const r of results) {
    for (const p of r.projects) {
      const mine = all.filter((q) => q.key === r.key && q.project === p.name);
      p.items = mine.map((q) => compare(q.item, got.get(q.customId), p));
    }
  }
  return [...got.values()].reduce((s, v) => s + (v.costUsd ?? 0), 0);
}

// Whether one task's grader met every expectation (with the judge's items too, when judged).
export function passedCase(r, { judged }) {
  return !r.leaks.length && !(r.blocked ?? []).length && !(r.unusable ?? []).length && !r.problems.length && r.projects.length > 1
    && r.projects.every((p) => p.repeatable === true && !p.problems.length && p.checks.every((x) => x.outcome === 'ok') && (!judged || (p.items ?? []).every((x) => x.outcome === 'ok')));
}
// Whether it plainly failed: something graded and not as expected (not an error).
export function failedCase(r) {
  return Boolean(r.leaks.length || (r.blocked ?? []).length || (r.unusable ?? []).length
    || r.projects.some((p) => p.repeatable === false || [...p.checks, ...(p.items ?? [])].some((x) => x.outcome === 'miss')));
}
// The pass record after a check: a pass is recorded (a pass without the judge
// keeps an earlier judged pass when nothing it depends on changed), a failure
// removes the entry, and a task that could not be graded keeps what it had.
export function updatePassed(passed, results, { judged, at = new Date().toISOString() }) {
  const next = { ...passed };
  for (const r of results) {
    const prev = next[r.key];
    const same = prev && prev.graderHash === r.graderHash && prev.fixtureHash === r.fixtureHash && prev.inputsHash === r.inputsHash;
    if (r.graderHash && r.inputsHash && passedCase(r, { judged })) next[r.key] = { graderHash: r.graderHash, fixtureHash: r.fixtureHash, inputsHash: r.inputsHash, judged: judged || Boolean(same && prev.judged), at };
    else if (failedCase(r)) delete next[r.key];
  }
  return next;
}

export function report(results, { judged, costUsd = 0 }) {
  const md = ['| Case | Project | Checks as expected | Repeatable |' + (judged ? ' Judge items as expected |' : ''), `| --- | --- | --- | --- |${judged ? ' --- |' : ''}`];
  const misses = [];
  const errors = [];
  for (const r of results) {
    for (const p of r.projects) {
      const n = (list, o) => list.filter((x) => x.outcome === o).length;
      md.push(`| ${r.key} | ${p.name} | ${n(p.checks, 'ok')} of ${p.checks.length} | ${p.repeatable === null ? 'not known' : p.repeatable ? 'yes' : '**no**'} |${judged ? ` ${p.items ? `${n(p.items, 'ok')} of ${p.items.length}` : '—'} |` : ''}`);
      for (const x of [...p.checks, ...(p.items ?? [])]) {
        if (x.outcome === 'miss') misses.push(`${r.key} ${p.name}: ${x.id} should ${x.want === 'PASS' ? 'PASS' : 'FAIL'}${p.kind === 'start' && x.value !== undefined ? ' with a share of 0' : ''}, got ${x.got}${x.value !== undefined ? ` (${x.value})` : ''}${x.detail ? `: ${String(x.detail).slice(0, 200)}` : ''}`);
        if (x.outcome === 'error') errors.push(`${r.key} ${p.name}: ${x.id}: ${x.got}${x.detail ? ` (${String(x.detail).slice(0, 200)})` : ''}`);
      }
      if (p.repeatable === false) misses.push(`${r.key} ${p.name}: the two grader runs disagree`);
      if (p.repeatable === null) errors.push(`${r.key} ${p.name}: a grader run gave ERROR (it could not finish, or the grader is broken), so repeatability is not known`);
      for (const pr of p.problems) errors.push(`${r.key} ${p.name}: ${pr}`);
    }
    for (const l of r.leaks) misses.push(`${r.key} leak: ${l}`);
    for (const u of r.unusable ?? []) misses.push(`${r.key} ${u}`);
    for (const b of r.blocked ?? []) misses.push(`${r.key} ${b}`);
    for (const pr of r.problems) errors.push(`${r.key}: ${pr}`);
  }
  if (misses.length) md.push('', 'Not as expected:', ...misses.map((m) => `- ${m}`));
  if (errors.length) md.push('', 'Not graded (fix, then run again):', ...errors.map((m) => `- ${m}`));
  if (judged) md.push('', `Judge cost: $${costUsd.toFixed(2)}`);
  return { md: md.join('\n'), misses, errors, exit: misses.length ? 2 : errors.length ? 3 : 0 };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const execute = argv.includes('--execute');
  if (execute && process.env.EVAL_ALLOW_MODEL !== '1') { console.error('Model calls are off: run this through `pnpm evals references check-graders --execute`.'); process.exit(1); }
  const i = argv.indexOf('--cases');
  const wanted = i >= 0 ? new Set(String(argv[i + 1] ?? '').split(',').filter(Boolean)) : null;
  const tasks = referenceCases().filter((c) => c.kind === 'task' && (!wanted || wanted.has(c.key)));
  if (!tasks.length) { console.error(wanted ? `no such task: ${[...wanted].join(', ')}` : 'no tasks yet in evals/references/cases/'); process.exit(1); }
  if (!dockerAvailable(IMAGE)) console.log(`Note: Docker or ${IMAGE} is not available, so grade.sh checks will be errors.\n`);
  const outDir = path.join(RUNS_ROOT, 'check-graders', `${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}Z`);
  mkdirSync(outDir, { recursive: true });
  const results = [];
  for (const c of tasks) {
    const specDir = path.join(FIXTURES_DIR, c.role, String(c.id));
    const startDir = mkdtempSync(path.join(os.tmpdir(), 'grader-start-'));
    try {
      const build = buildFixture({ specDir, out: startDir, commit: BASE_COMMIT });
      if (build.problems.length) { results.push({ key: c.key, projects: [], leaks: [], unusable: [], problems: build.problems.map((p) => `fixture: ${p}`), requests: [] }); continue; }
      const spec = JSON.parse(readFileSync(path.join(specDir, 'spec.json'), 'utf8'));
      const r = await checkTask({ key: c.key, graderDir: path.join(GRADERS_ROOT, c.key), startDir, spec, runtime: resolveSpec(specDir).runtime, judge: execute });
      results.push({ ...r, fixtureHash: build.fixtureHash, graderHash: graderHash(path.join(GRADERS_ROOT, c.key)), inputsHash: checkInputsHash(specDir) });
      console.log(`${c.key}: ${r.projects.length} projects graded`);
    } catch (error) {
      results.push({ key: c.key, projects: [], leaks: [], unusable: [], problems: [error.message], requests: [] });
    } finally {
      rmSync(startDir, { recursive: true, force: true });
    }
  }
  const costUsd = execute ? await judgeTasks(results, { outDir }) : 0;
  const out = report(results, { judged: execute, costUsd });
  // The record the real runs check (pipeline.mjs).
  const passed = existsSync(PASSED) ? JSON.parse(readFileSync(PASSED, 'utf8')) : {};
  writeFileSync(PASSED, JSON.stringify(updatePassed(passed, results, { judged: execute }), null, 2));
  writeFileSync(path.join(outDir, 'summary.md'), `# Grader check\n\n${out.md}\n`);
  // The requests are saved apart (judge/), not in the summary.
  writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify({ results: results.map((r) => ({ ...r, requests: undefined })), misses: out.misses, errors: out.errors, costUsd, judged: execute }, null, 2));
  console.log(`\n${out.md}\n\nWritten to ${path.join(outDir, 'summary.md')}`);
  process.exit(out.exit);
}
