#!/usr/bin/env node
// Carry reviewed fixtures to a newer framework release. No model call.
//
//   node migrate-fixtures.mjs migrate [--commit v0.15.0] [--jobs N] [--no-self-checks] [<target> ...]
//
// Phase 1 checks, before anything is edited, that each reviewed spec still
// builds exactly what its review covered: the build at the review's commit
// must give reviewedBy.fixtureHash. A spec whose files or bases changed since
// (an edit, a reformat, a lost file, a fixed base) has no review left to carry.
//
// Phase 2, for every base (parents first) and then every case:
//   1. mechanical edits the release needs (lib/migrate.mjs): Active
//      Work.CompletionPolicy in each STATE.md (required since 0.10.0), the
//      current managed AGENTS.md block in a layer's copy of AGENTS.md, and the
//      version a stub `standards` CLI reports;
//   2. refreshes the base hashes a verified spec recorded, since step 1 edits
//      bases mechanically;
//   3. compares the case with the text the fixture was written for: assertions
//      only appended -> caseHash updated, and the new assertions get an empty
//      check entry, so the judge grades them; any other change -> regenerate;
//   4. runs gates 1 and 2 at the commit (spec structure, build, check.mjs,
//      prompt facts; selfChecks in Docker unless --no-self-checks).
// Then the status:
//   - verified and passing: carried over. It stays "reviewed";
//     reviewedBy.fixtureHash and .commit become the new build's, and
//     reviewedBy.carriedOver names the review it came from and whether the
//     selfChecks ran (fixtures without them are not ready to run).
//   - reviewed but not verified, or a spec whose stub CLI or VERSION.json
//     layer ties it to a release: "gated", for a new gate-3 review.
//   - gated or flagged before: unchanged (still waiting for a review or for
//     the owner). A draft that now passes: gated.
//   - failing gates 1-2: "draft" with needsRegeneration (keeping the status it
//     had, so a later pass restores that status, never a review it lacked).
// Every change is recorded in the spec's `migrations` list.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BASES_DIR, buildFixture, frameworkAt, resolveSpec } from './build-fixture.mjs';
import { DEFAULT_COMMIT, findCase } from './lib/cases.mjs';
import { caseChange, migrateStateFiles, updateManagedBlocks, updateStubVersions } from './lib/migrate.mjs';
import { frameworkForContainer } from './lib/runtime.mjs';
import { dockerAvailable } from './lib/selfcheck.mjs';
import { allTargets } from './flags.mjs';
import { targetDir } from './generate-fixture.mjs';
import { validate } from './validate-fixture.mjs';

const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const writeSpec = (dir, spec) => writeFileSync(path.join(dir, 'spec.json'), `${JSON.stringify(spec, null, 2)}\n`);
// The status a spec had before any migration set it aside.
const priorStatus = (spec) => spec.needsRegeneration?.fromStatus ?? spec.status;
// The commit the spec's reviewed (or generated) build was made at.
const reviewCommit = (spec) => spec.reviewedBy?.commit ?? spec.generatedBy?.commit ?? null;

// Bases in dependency order: every parent before the bases built on it.
function basesInOrder() {
  if (!existsSync(BASES_DIR)) return [];
  const names = readdirSync(BASES_DIR).filter((n) => existsSync(path.join(BASES_DIR, n, 'spec.json'))).sort();
  const out = [];
  const visit = (n, seen = []) => {
    if (out.includes(n) || seen.includes(n)) return;
    const parent = readJson(path.join(BASES_DIR, n, 'spec.json')).base;
    if (parent) visit(parent, [...seen, n]);
    out.push(n);
  };
  for (const n of names) visit(n);
  return out.map((n) => `base:${n}`);
}

// Phase 1: whether the spec still builds what its review covered.
export function verifyOne(target) {
  const dir = targetDir(target);
  const spec = readJson(path.join(dir, 'spec.json'));
  if (priorStatus(spec) !== 'reviewed') return { verified: false, why: `status ${priorStatus(spec)}: no review to carry over` };
  const hash = spec.reviewedBy?.fixtureHash;
  const commit = reviewCommit(spec);
  if (!hash || !commit) return { verified: false, why: 'the review records no build' };
  const out = path.join(os.tmpdir(), 'standards-eval-verify', target.replace(':', '-'));
  try {
    const built = buildFixture({ specDir: dir, out, commit, allowStaleCase: true }).fixtureHash;
    return built === hash ? { verified: true } : { verified: false, why: `its files changed since the review (build ${built}, reviewed ${hash})` };
  } catch (error) {
    return { verified: false, why: `the reviewed build cannot be rebuilt: ${error.message}` };
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

// A spec whose stub `standards` CLI or VERSION.json layer is tied to the
// release it was written for: a model reviews it again at a new release.
function releaseBound(dir, spec) {
  if (spec.runtime?.standardsCli?.mode === 'stub') return 'its stub standards CLI';
  const layer = (spec.layers ?? []).find((l) => l.dir && existsSync(path.join(dir, l.dir, '.standards', 'VERSION.json')));
  return layer ? `its ${layer.dir}/.standards/VERSION.json` : null;
}

// Phase 2 for one spec. `check` is its phase-1 result.
export async function migrateOne(target, { commit, sha, selfChecks, check }) {
  const dir = targetDir(target);
  const spec = readJson(path.join(dir, 'spec.json'));
  if (spec.status === 'rejected') return { target, result: 'skipped', why: 'deferred by the owner' };
  const before = priorStatus(spec);
  const from = reviewCommit(spec);
  const record = { to: sha, toRef: commit, at: new Date().toISOString() };
  if (!check.verified && before === 'reviewed') record.notVerified = check.why;
  const state = migrateStateFiles(dir);
  if (state.some((c) => c.completionPolicy)) record.completionPolicy = state.filter((c) => c.completionPolicy).map((c) => `${c.file}: ${c.completionPolicy}`);
  if (state.some((c) => c.skipped && !/already has/.test(c.skipped))) record.stateNotMigrated = state.filter((c) => c.skipped && !/already has/.test(c.skipped)).map((c) => `${c.file}: ${c.skipped}`);
  const blocks = updateManagedBlocks(dir, from, sha);
  if (blocks.length) record.managedBlock = blocks;
  const stub = updateStubVersions(dir, spec, from, sha);
  if (stub.length) record.stubVersion = stub;
  // A verified spec was consistent with its bases before this migration
  // edited them, so their new hashes are recorded. An unverified one keeps
  // its old ones: it goes to review, which records them.
  if (spec.baseHashes && check.verified) {
    const now = Object.fromEntries(resolveSpec(dir).bases.map((b) => [b.name, b.hash]));
    if (JSON.stringify(now) !== JSON.stringify(spec.baseHashes)) { spec.baseHashes = now; record.baseHashes = 'refreshed after the bases were migrated'; }
  }
  const problems = [];
  if (spec.case) {
    const kase = findCase(spec.case);
    const change = caseChange(kase, spec.caseHash);
    if (change.kind === 'appended') {
      for (const i of change.added) if (!(spec.checks ?? []).some((c) => c.assertion === i)) spec.checks.push({ assertion: i, complete: false, all: [], why: 'assertion added to the case after this fixture was reviewed; graded by the judge' });
      spec.checks.sort((a, b) => a.assertion - b.assertion);
      record.appendedAssertions = change.added;
      record.caseHash = { from: spec.caseHash, to: kase.hash };
      spec.caseHash = kase.hash;
    } else if (change.kind === 'changed') {
      problems.push(change.detail);
    }
  }
  writeSpec(dir, spec);
  let build = null;
  if (!problems.length) {
    const v = await validate(dir, { commit, selfChecks, allowStaleBases: !check.verified });
    problems.push(...v.problems);
    build = v.build;
    if ((spec.selfChecks ?? []).length) record.selfChecks = v.selfChecks?.ran ? 'passed' : 'not run (--no-self-checks)';
  }
  const bound = releaseBound(dir, spec);
  if (problems.length) {
    record.result = 'needs-regeneration';
    record.problems = problems;
    spec.status = 'draft';
    spec.gateProblems = problems;
    spec.needsRegeneration = { reason: `does not pass at ${commit} after migration`, at: record.at, fromStatus: before };
  } else {
    delete spec.needsRegeneration;
    delete spec.gateProblems;
    if (before === 'reviewed' && check.verified && !(bound && from !== sha)) {
      const was = spec.reviewedBy ?? {};
      // Reviewed at this very build already: nothing to carry.
      if (!(was.commit === sha && was.fixtureHash === build.fixtureHash && !was.carriedOver)) {
        spec.reviewedBy = { ...was, fixtureHash: build.fixtureHash, commit: sha,
          carriedOver: { fromFixtureHash: was.carriedOver?.fromFixtureHash ?? was.fixtureHash ?? null, fromCommit: was.carriedOver?.fromCommit ?? from,
            commit: sha, at: record.at, selfChecks: (spec.selfChecks ?? []).length ? record.selfChecks : 'none' } };
      }
      spec.status = 'reviewed';
      record.result = 'carried-over';
    } else if (before === 'reviewed') {
      spec.status = 'gated';
      record.result = 'needs-review';
      record.why = check.verified ? `${bound} is tied to the release; a new review checks it` : check.why;
    } else {
      // Waiting for a review (gated) or for the owner (flagged) stays so; a draft that now passes is ready for review.
      spec.status = before === 'flagged' ? 'flagged' : 'gated';
      record.result = spec.status === 'flagged' ? 'needs-decision' : 'needs-review';
    }
  }
  // Repeated migrations to the same commit replace their record, but keep
  // what earlier passes changed (a second pass finds nothing left to change).
  const prev = (spec.migrations ?? []).find((m) => m.to === sha) ?? {};
  const kept = Object.fromEntries(['completionPolicy', 'managedBlock', 'stubVersion', 'appendedAssertions', 'caseHash', 'baseHashes', 'fixes'].filter((k) => prev[k] && !record[k]).map((k) => [k, prev[k]]));
  spec.migrations = [...(spec.migrations ?? []).filter((m) => m.to !== sha), { ...kept, ...record }];
  writeSpec(dir, spec);
  return { target, result: record.result, problems, why: record.why };
}

// Runs `targets` in `jobs` worker processes of this script (builds are
// blocking child processes, so workers are what makes them parallel).
function workers(targets, jobs, args) {
  const self = fileURLToPath(import.meta.url);
  const chunks = Array.from({ length: jobs }, (_, k) => targets.filter((_, i) => i % jobs === k)).filter((c) => c.length);
  return Promise.all(chunks.map((chunk, k) => new Promise((resolve) => {
    const child = spawn(process.execPath, [self, 'migrate', '--worker', ...args(k), ...chunk], { stdio: ['ignore', 'inherit', 'inherit'] });
    child.on('close', resolve);
  })));
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const opt = (name, dflt) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : dflt; };
  const [cmd] = argv;
  if (cmd !== 'migrate') throw new Error('usage: migrate-fixtures.mjs migrate [--commit <ref>] [--jobs N] [--no-self-checks] [<target> ...]');
  const commit = opt('commit', DEFAULT_COMMIT);
  const sha = frameworkAt(commit).sha;
  const valued = new Set(['--commit', '--jobs', '--verify-out', '--checks']);
  const named = argv.slice(1).filter((a, i, all) => !a.startsWith('--') && !valued.has(all[i - 1]));
  const worker = argv.includes('--worker');
  // Gate 1 includes selfChecks, which need Docker and the runner image (as in
  // generate-fixture.mjs). --no-self-checks carries specs over without them,
  // recorded as such: they are not ready to run until a migration with Docker.
  const selfChecks = !argv.includes('--no-self-checks');
  if (selfChecks && !worker && !dockerAvailable()) {
    console.error('Docker or the runner image is not available, so selfChecks cannot run; run `pnpm evals image build` first (or pass --no-self-checks)');
    process.exit(1);
  }
  // A phase-1 worker: verify its targets, write the results, nothing else.
  if (worker && opt('verify-out')) {
    writeFileSync(opt('verify-out'), JSON.stringify(Object.fromEntries(named.map((t) => [t, verifyOne(t)]))));
    process.exit(0);
  }
  const report = (r) => console.log(`${r.target}: ${r.result}${r.why ? ` (${r.why})` : ''}${r.problems?.length ? `\n  - ${r.problems.join('\n  - ').slice(0, 2000)}` : ''}`);
  // A phase-2 worker: migrate its cases with the phase-1 results it was given.
  if (worker) {
    const checks = readJson(opt('checks'));
    for (const t of named) report(await migrateOne(t, { commit, sha, selfChecks, check: checks[t] ?? { verified: false, why: 'not verified' } }));
    process.exit(0);
  }
  const bases = basesInOrder();
  const targets = named.length ? named : [...bases, ...allTargets().filter((t) => !t.startsWith('base:'))];
  const baseTargets = bases.filter((b) => targets.includes(b));
  const caseTargets = targets.filter((t) => !t.startsWith('base:'));
  const jobs = Math.max(1, Number(opt('jobs', 1)));
  // Phase 1, before any edit: every spec against its reviewed build.
  const scratch = path.join(os.tmpdir(), `standards-eval-migrate-${process.pid}`);
  mkdirSync(scratch, { recursive: true });
  let checks = {};
  const all = [...baseTargets, ...caseTargets];
  if (jobs > 1 && all.length > 1) {
    // Every framework export the workers need, made once here.
    frameworkAt(commit);
    for (const c of new Set(all.map((t) => reviewCommit(readJson(path.join(targetDir(t), 'spec.json')))).filter(Boolean))) frameworkAt(c);
    await workers(all, jobs, (k) => ['--commit', commit, '--verify-out', path.join(scratch, `verify-${k}.json`)]);
    for (const f of readdirSync(scratch).filter((n) => n.startsWith('verify-'))) checks = { ...checks, ...readJson(path.join(scratch, f)) };
  } else {
    for (const t of all) checks[t] = verifyOne(t);
  }
  const unverified = all.filter((t) => !checks[t]?.verified && checks[t]?.why && !/^status /.test(checks[t].why));
  if (unverified.length) console.log(`${unverified.length} reviewed spec(s) no longer build what was reviewed; they go to review:\n${unverified.map((t) => `  - ${t}: ${checks[t].why}`).join('\n')}\n`);
  writeFileSync(path.join(scratch, 'checks.json'), JSON.stringify(checks));
  // Phase 2: bases in order (cases build on them), then cases.
  for (const t of baseTargets) report(await migrateOne(t, { commit, sha, selfChecks, check: checks[t] }));
  if (jobs > 1 && caseTargets.length > 1) {
    // Caches the workers share, made once: the framework export and, for
    // selfChecks that use the standards shim, its container copy.
    if (selfChecks) frameworkForContainer(frameworkAt(commit).dir, sha);
    await workers(caseTargets, jobs, () => ['--commit', commit, '--checks', path.join(scratch, 'checks.json'), ...(selfChecks ? [] : ['--no-self-checks'])]);
  } else {
    for (const t of caseTargets) report(await migrateOne(t, { commit, sha, selfChecks, check: checks[t] }));
  }
  rmSync(scratch, { recursive: true, force: true });
  // The summary comes from what each spec recorded for this commit.
  const results = all.map((t) => {
    const spec = readJson(path.join(targetDir(t), 'spec.json'));
    return spec.status === 'rejected' ? 'skipped' : (spec.migrations ?? []).find((m) => m.to === sha)?.result ?? 'not migrated';
  });
  const count = (k) => results.filter((r) => r === k).length;
  console.log(`\n${results.length} specs at ${commit} (${sha.slice(0, 7)}): ${count('carried-over')} carried over, ${count('needs-review')} need review, ${count('needs-decision')} need your decision, ${count('needs-regeneration')} need regeneration, ${count('skipped')} skipped${count('not migrated') ? `, ${count('not migrated')} not migrated (a worker failed; see above)` : ''}`);
  if (!selfChecks) console.log('selfChecks did not run: run `pnpm evals fixtures migrate` again with Docker before running the evals.');
  process.exit(0);
}
