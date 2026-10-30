// Self-test of everything step 0 added, with a fake Claude API (no model, no
// network, no Docker). selftest.mjs runs this in a child process with:
//   EVAL_FIXTURES_DIR    a scratch fixtures root (the real specs are never touched)
//   EVAL_FAKE_TRANSPORT  ./fake-transport.mjs, EVAL_FAKE_DIR its scripted answers
//   EVAL_SPEND_LOG       a scratch spend log
// Prints one JSON object: { checks: [{ name, ok, detail }] }.
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildFixture, frameworkAt, resolveSpec } from '../build-fixture.mjs';
import { costOf } from '../lib/anthropic.mjs';
import { DEFAULT_COMMIT, EVALS_ROOT, FIXTURES_ROOT, SAMPLES_ROOT, findCase, loadRole } from '../lib/cases.mjs';
import { seedSession, verifySeeding } from '../lib/session.mjs';
import { generateOne, materialize } from '../generate-fixture.mjs';
import { reviewOne } from '../review-fixture.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const H = path.dirname(HERE);
const FAKE = process.env.EVAL_FAKE_DIR;
const TMP = path.dirname(FIXTURES_ROOT);
const checks = [];
const check = (name, ok, detail = '') => checks.push({ name, ok: Boolean(ok), detail: String(detail).slice(0, 300) });
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const node = (args, env = {}) => spawnSync('node', args, { encoding: 'utf8', env: { ...process.env, ...env } });
const REAL = SAMPLES_ROOT;

// Files of a real sample layer as generator output entries.
const filesOf = (dir, prefix) => {
  const out = [];
  const walk = (rel) => {
    for (const n of readdirSync(path.join(dir, rel))) {
      const r = rel ? `${rel}/${n}` : n;
      if (statSync(path.join(dir, r)).isDirectory()) walk(r);
      else out.push({ path: `${prefix}/${r}`, content: readFileSync(path.join(dir, r), 'utf8'), executable: false, symlink_target: '' });
    }
  };
  walk('');
  return out;
};

// Scratch fixtures root: the three samples, and one shared base description.
for (const [r, id] of [['developer', 1], ['navigator', 3], ['reviewer', 2]]) cpSync(path.join(REAL, r, String(id)), path.join(FIXTURES_ROOT, r, String(id)), { recursive: true });
mkdirSync(path.join(FIXTURES_ROOT, '_bases/mini'), { recursive: true });
writeFileSync(path.join(FIXTURES_ROOT, '_bases/mini/base.json'), JSON.stringify({ name: 'mini', extends: null, reference: [], useFor: { roles: ['developer'], states: ['DEVELOPING'] }, description: 'The profile service before the nickname cycle.' }));
mkdirSync(FAKE, { recursive: true });

// 1. A shared base: generated (fake), gated, reviewed.
const dev = readJson(path.join(REAL, 'developer/1/spec.json'));
writeFileSync(path.join(FAKE, 'gen-1.json'), JSON.stringify({
  spec_json: JSON.stringify({ base: null, install: { mode: 'brownfield', hooks: true }, layers: [{ dir: 'layers/00-project', phase: 'pre-install', action: 'commit', message: 'Initial project' }], expectCheck: { ok: true }, vars: { ID: dev.vars.ID }, notes: 'project only', baseFacts: ['app/ holds the profile service'] }),
  files: filesOf(path.join(REAL, 'developer/1/layers/00-project'), 'layers/00-project'), notes_for_reviewer: 'none',
}));
const b = await generateOne('base:mini', { commit: DEFAULT_COMMIT, selfChecks: false });
check('generator: a shared base is written, built, and gated', b.status === 'gated' && existsSync(path.join(FIXTURES_ROOT, '_bases/mini/spec.json')), JSON.stringify(b.problems));
const br = await reviewOne('base:mini', { commit: DEFAULT_COMMIT });
// A base names the scenario it serves; a case whose prompt does not name it gets no suggestion.
{
  const { suggestedBase } = await import('../generate-fixture.mjs');
  const bj = path.join(FIXTURES_ROOT, '_bases/mini/base.json');
  const orig = readFileSync(bj, 'utf8');
  const withMatch = (m) => writeFileSync(bj, JSON.stringify({ ...JSON.parse(orig), useFor: { roles: ['developer'], match: m } }));
  withMatch('profile nickname');
  const hit = suggestedBase(findCase('developer-1'))?.name;
  withMatch('export-20260924T090000Z-a7f3c1d2');
  const miss = suggestedBase(findCase('developer-1'));
  writeFileSync(bj, orig);
  check('generator: a base is suggested only to cases whose prompt names its scenario', hit === 'mini' && miss === null, `${hit} ${miss}`);
}
check('reviewer: a base with no blocking issue becomes reviewed', br.status === 'reviewed', JSON.stringify(br));

// 2. A case on the base, first output broken (no entry for assertion 5), repaired on the second call.
const caseSpec = (withAll) => ({
  base: 'mini', install: { mode: 'brownfield', hooks: true },
  layers: [{ dir: 'layers/50-workflow', action: 'commit', message: 'Scope and design for profile nickname' }],
  expectCheck: { ok: true }, prompt: dev.prompt, graderOnly: [], history: null, vars: { DEV: dev.vars.DEV },
  checks: withAll ? dev.checks : dev.checks.filter((c) => c.assertion !== 5), invariants: dev.invariants, selfChecks: [], notes: 'overlay',
  // The model tries to set harness-owned fields; they must be overwritten.
  case: 'developer-2', caseHash: 'bogus', status: 'reviewed',
});
const devFiles = filesOf(path.join(REAL, 'developer/1/layers/10-workflow'), 'layers/50-workflow');
writeFileSync(path.join(FAKE, 'gen-2.json'), JSON.stringify({ spec_json: JSON.stringify(caseSpec(false)), files: devFiles, notes_for_reviewer: 'x' }));
writeFileSync(path.join(FAKE, 'gen-3.json'), JSON.stringify({ spec_json: JSON.stringify(caseSpec(true)), files: devFiles, notes_for_reviewer: 'check the plan layer' }));
const g = await generateOne('developer-1', { commit: DEFAULT_COMMIT, selfChecks: false });
const gs = readJson(path.join(FIXTURES_ROOT, 'developer/1/spec.json'));
const genRuns = readdirSync(path.join(FIXTURES_ROOT, 'developer/1/gen')).filter((d) => !d.startsWith('review-'));
const log = readJson(path.join(FIXTURES_ROOT, 'developer/1/gen', genRuns.at(-1), 'log.json'));
const req2 = readJson(path.join(FIXTURES_ROOT, 'developer/1/gen', genRuns.at(-1), 'request-2.json'));
const resp1 = readJson(path.join(FIXTURES_ROOT, 'developer/1/gen', genRuns.at(-1), 'response-1.json'));
check('generator: a gate failure gets one repair call in the same conversation, and the repaired spec is gated',
  g.status === 'gated' && log.attempts.length === 2 && log.attempts[0].problems.some((p) => /assertion 5 has no entry/.test(p)) && !log.attempts[1].problems.length
  && req2.messages.length === 3 && JSON.stringify(req2.messages[1].content) === JSON.stringify(resp1.content), JSON.stringify(log.attempts.map((a) => a.problems)));
check('generator: harness-owned fields (case, caseHash, status) and base hashes are set by the harness',
  gs.case === 'developer-1' && gs.caseHash === findCase('developer-1').hash && gs.status === 'gated' && gs.baseHashes?.mini && gs.generatedBy?.commit, JSON.stringify({ case: gs.case, status: gs.status, baseHashes: gs.baseHashes }));
const built = buildFixture({ specDir: path.join(FIXTURES_ROOT, 'developer/1'), out: path.join(TMP, 'onbase'), commit: DEFAULT_COMMIT });
const log2 = execFileSync('git', ['log', '--format=%s'], { cwd: path.join(TMP, 'onbase'), encoding: 'utf8' }).trim().split('\n');
const rv0 = resolveSpec(path.join(FIXTURES_ROOT, 'developer/1')).vars;
check('builder: base layers first, then the case overlay; base vars merge with the case\'s', built.problems.length === 0 && log2[0] === 'Scope and design for profile nickname' && log2.at(-1) === 'Initial project'
  && rv0.ID === dev.vars.ID && rv0.DEV === dev.vars.DEV, `${log2.join(' < ')} ${JSON.stringify(rv0)}`);
check('generator: the repair call carries the gate problems', /assertion 5 has no entry/.test(JSON.stringify(req2.messages[2].content)), JSON.stringify(req2.messages[2].content).slice(0, 200));

// 2b. Both attempts fail: exactly two calls, and the spec stays draft with its gate problems.
{
  const before = Number(readFileSync(path.join(FAKE, 'gen.count'), 'utf8'));
  const bad = { spec_json: JSON.stringify(caseSpec(false)), files: devFiles, notes_for_reviewer: '' };
  writeFileSync(path.join(FAKE, `gen-${before + 1}.json`), JSON.stringify(bad));
  writeFileSync(path.join(FAKE, `gen-${before + 2}.json`), JSON.stringify(bad));
  writeFileSync(path.join(FAKE, `gen-${before + 3}.json`), JSON.stringify({ spec_json: JSON.stringify(caseSpec(true)), files: devFiles, notes_for_reviewer: '' }));
  cpSync(path.join(FIXTURES_ROOT, 'developer/1'), path.join(TMP, 'dev1-keep'), { recursive: true });
  const f = await generateOne('developer-1', { commit: DEFAULT_COMMIT, selfChecks: false });
  const calls = Number(readFileSync(path.join(FAKE, 'gen.count'), 'utf8')) - before;
  const fs2 = readJson(path.join(FIXTURES_ROOT, 'developer/1/spec.json'));
  check('generator: when the repair also fails, no third call; the spec stays draft with its gate problems', calls === 2 && f.status === 'draft' && fs2.gateProblems?.some((g) => /assertion 5 has no entry/.test(g)), `${calls} calls, ${f.status}`);
  // Leave the pipeline's developer-1 as it was (the fake's third answer is unused).
  rmSync(path.join(FIXTURES_ROOT, 'developer/1'), { recursive: true, force: true });
  cpSync(path.join(TMP, 'dev1-keep'), path.join(FIXTURES_ROOT, 'developer/1'), { recursive: true });
  writeFileSync(path.join(FAKE, 'gen.count'), String(before + 3));
}

// 2b2. A failed repair call keeps the paid first attempt (draft, its cost, no
// staging dir left for flags.mjs to trip on); output that cannot be written gets
// the repair call; a stream that breaks mid-way is logged as unknown spend.
{
  const before = Number(readFileSync(path.join(FAKE, 'gen.count'), 'utf8'));
  cpSync(path.join(FIXTURES_ROOT, 'developer/1'), path.join(TMP, 'dev1-keep2'), { recursive: true });
  const bad = { spec_json: JSON.stringify(caseSpec(false)), files: devFiles, notes_for_reviewer: '' };
  writeFileSync(path.join(FAKE, `gen-${before + 1}.json`), JSON.stringify(bad));
  writeFileSync(path.join(FAKE, `gen-${before + 2}.json`), JSON.stringify({ __throw: '529 overloaded_error', __partial: true }));
  const spendBefore = readFileSync(process.env.EVAL_SPEND_LOG, 'utf8').trim().split('\n').length;
  const f = await generateOne('developer-1', { commit: DEFAULT_COMMIT, selfChecks: false });
  const fs3 = readJson(path.join(FIXTURES_ROOT, 'developer/1/spec.json'));
  const genRuns3 = readdirSync(path.join(FIXTURES_ROOT, 'developer/1/gen')).filter((d) => !d.startsWith('review-')).sort();
  const spend = readFileSync(process.env.EVAL_SPEND_LOG, 'utf8').trim().split('\n').slice(spendBefore).map((l) => JSON.parse(l));
  const { allTargets } = await import('../flags.mjs');
  check('generator: a repair call that fails keeps the first attempt as draft with its cost and the error; no staging dir is left; the broken stream is logged as unknown spend',
    f.status === 'draft' && f.costUsd > 0 && fs3.gateProblems?.some((g) => /API call failed: 529/.test(g)) && !existsSync(path.join(FIXTURES_ROOT, 'developer/1.staging'))
    && existsSync(path.join(FIXTURES_ROOT, 'developer/1/gen', genRuns3.at(-1), 'log.json')) && spend.some((e) => e.partial && e.costUsd === null) && !allTargets().some((t) => /staging/.test(t)),
    JSON.stringify({ status: f.status, cost: f.costUsd, gp: fs3.gateProblems, spend }));
  // Output that cannot be written (a path that is both a file and a directory) is a gate problem for the repair call.
  const clash = { spec_json: JSON.stringify(caseSpec(true)), files: [...devFiles, { path: 'layers/90-x/a', content: 'x', executable: false, symlink_target: '' }, { path: 'layers/90-x/a/b', content: 'y', executable: false, symlink_target: '' }], notes_for_reviewer: '' };
  writeFileSync(path.join(FAKE, `gen-${before + 3}.json`), JSON.stringify(clash));
  writeFileSync(path.join(FAKE, `gen-${before + 4}.json`), JSON.stringify({ spec_json: JSON.stringify(caseSpec(true)), files: devFiles, notes_for_reviewer: '' }));
  const h = await generateOne('developer-1', { commit: DEFAULT_COMMIT, selfChecks: false });
  check('generator: output that cannot be written gets the repair call instead of crashing', h.status === 'gated' && h.attempts === 2, JSON.stringify(h.problems));
  rmSync(path.join(FIXTURES_ROOT, 'developer/1'), { recursive: true, force: true });
  cpSync(path.join(TMP, 'dev1-keep2'), path.join(FIXTURES_ROOT, 'developer/1'), { recursive: true });
  // A base whose parent failed its gates, or a case whose base is not ready, is refused before any call; useFor.exclude opts a case out.
  const nBefore = Number(readFileSync(path.join(FAKE, 'gen.count'), 'utf8'));
  mkdirSync(path.join(FIXTURES_ROOT, '_bases/broken'), { recursive: true });
  writeFileSync(path.join(FIXTURES_ROOT, '_bases/broken/base.json'), JSON.stringify({ name: 'broken', extends: null, useFor: { roles: ['reviewer'], match: 'export-20260924T090000Z-a7f3c1d2' }, description: 'x' }));
  writeFileSync(path.join(FIXTURES_ROOT, '_bases/broken/spec.json'), JSON.stringify({ base: null, status: 'draft', layers: [] }));
  mkdirSync(path.join(FIXTURES_ROOT, '_bases/child'), { recursive: true });
  writeFileSync(path.join(FIXTURES_ROOT, '_bases/child/base.json'), JSON.stringify({ name: 'child', extends: 'broken', useFor: { roles: [] }, description: 'x' }));
  let childErr = ''; try { await generateOne('base:child', { commit: DEFAULT_COMMIT, selfChecks: false }); } catch (e) { childErr = e.message; }
  const childGenLeft = existsSync(path.join(FIXTURES_ROOT, '_bases/child/gen'));
  const { suggestedBase } = await import('../generate-fixture.mjs');
  let caseErr = ''; try { suggestedBase(findCase('reviewer-1')); } catch (e) { caseErr = e.message; }
  const bj = path.join(FIXTURES_ROOT, '_bases/broken/base.json');
  writeFileSync(bj, JSON.stringify({ ...readJson(bj), useFor: { roles: ['reviewer'], match: 'export-20260924T090000Z-a7f3c1d2', exclude: ['reviewer-1'] } }));
  const excluded = suggestedBase(findCase('reviewer-1'));
  for (const b of ['broken', 'child']) rmSync(path.join(FIXTURES_ROOT, '_bases', b), { recursive: true, force: true });
  check('generator: a child base on a parent that failed its gates, or a case on a base not ready, is refused before any call; useFor.exclude opts a case out',
    /base broken is draft/.test(childErr) && !childGenLeft && /base broken is draft/.test(caseErr) && excluded === null && Number(readFileSync(path.join(FAKE, 'gen.count'), 'utf8')) === nBefore, `${childErr} | ${caseErr}`);
  // Without Docker (or the runner image), generation refuses unless selfChecks are waived.
  const nd = node([path.join(H, 'generate-fixture.mjs'), 'developer-1', '--force'], { EVAL_IMAGE: 'standards-eval:no-such-image' });
  check('generate-fixture: refuses to start when selfChecks cannot run (no Docker or image)', nd.status === 1 && /selfChecks cannot run/.test(nd.stderr) && Number(readFileSync(path.join(FAKE, 'gen.count'), 'utf8')) === nBefore, nd.stderr.slice(-200));
}

// 2c. N/A belongs to the owner; outputs cannot escape the spec dir.
{
  const d9 = findCase('developer-9');
  const nChecks = d9.assertions.map((_, i) => ({ assertion: i, complete: false, all: [] })).filter((c) => c.assertion !== 7);
  nChecks[1] = { assertion: 1, na: true, na_reason: 'hard to observe' };
  const staging = path.join(TMP, 'mat-d9');
  const m = materialize('developer-9', { spec_json: JSON.stringify({ layers: [], checks: nChecks, decision: { action: 'run' }, status: 'reviewed' }), files: [], notes_for_reviewer: '' }, staging, { sha: 'x', model: 'm' });
  const c7 = m.spec.checks.find((c) => c.assertion === 7);
  check('generator: a listed N/A is set (even when left out), a model-invented N/A is a gate problem, and decision or status from the model are dropped',
    c7?.na === true && /^listed N\/A:/.test(c7.na_reason) && m.problems.some((p) => /assertion 1 is marked N\/A/.test(p)) && !m.spec.decision && m.spec.status === 'draft', JSON.stringify(m.problems));
  // An assertion the catalog routes to the judge is never left to code alone.
  const routed = materialize('developer-1', { spec_json: JSON.stringify({ layers: [], checks: findCase('developer-1').assertions.map((_, i) => ({ assertion: i, complete: true, all: [{ exists: 'x' }] })) }), files: [], notes_for_reviewer: '' }, path.join(TMP, 'mat-d1'), { sha: 'x', model: 'm' });
  check('generator: complete true becomes false on assertions the catalog routes to the judge (developer-1.0 and .4), and stays on code-decided ones',
    routed.spec.checks[0].complete === false && routed.spec.checks[4].complete === false && routed.spec.checks[1].complete === true, JSON.stringify(routed.spec.checks.map((c) => c.complete)));
  // A decision-8 assertion the model graded is still set N/A.
  const graded7 = materialize('developer-9', { spec_json: JSON.stringify({ layers: [], checks: d9.assertions.map((_, i) => ({ assertion: i, complete: false, all: [] })) }), files: [], notes_for_reviewer: '' }, path.join(TMP, 'mat-d9b'), { sha: 'x', model: 'm' });
  check('generator: a listed N/A assertion the model graded is set N/A anyway', graded7.spec.checks.find((c) => c.assertion === 7)?.na === true && !graded7.problems.length, JSON.stringify(graded7.problems));
  const esc = materialize('developer-9', { spec_json: '{"layers":[]}', notes_for_reviewer: '', files: [
    { path: 'layers/00-a/link', content: '', executable: false, symlink_target: path.join(TMP, 'outside-target') },
    { path: 'layers/00-a/link/pwned.txt', content: 'x', executable: false, symlink_target: '' },
    { path: 'layers/../spec.json', content: '{}', executable: false, symlink_target: '' },
    { path: 'gen/x.json', content: '{}', executable: false, symlink_target: '' }] }, path.join(TMP, 'mat-esc'), { sha: 'x', model: 'm' });
  check('generator: a file under a symlink, a path out of layers/, and a path outside layers/ or runtime/ are refused',
    esc.problems.length === 3 && !existsSync(path.join(TMP, 'outside-target', 'pwned.txt')), JSON.stringify(esc.problems));
}

// 3. Review with a blocking issue -> flagged; flags lists it; the owner's "run" -> reviewed.
writeFileSync(path.join(FAKE, 'review-developer-1.json'), JSON.stringify({ conditions: [{ condition: 'Development is NONE', where: '.standards/STATE.md', status: 'realized' }], issues: [{ severity: 'blocking', kind: 'check-too-strict', assertion: 4, detail: 'BlockedOn may hold a question', recommendation: 'run_as_is', fix: '' }, { severity: 'note', kind: 'realism', assertion: -1, detail: 'tiny', recommendation: 'run_as_is', fix: '' }], verdict: 'issues', summary: 'one blocking issue' }));
const rv = await reviewOne('developer-1', { commit: DEFAULT_COMMIT });
const revReq = readJson(path.join(FIXTURES_ROOT, 'developer/1/gen', readdirSync(path.join(FIXTURES_ROOT, 'developer/1/gen')).filter((d) => d.startsWith('review-')).at(-1), 'request.json'));
const revText = JSON.stringify(revReq);
check('reviewer: sees the case, the spec, the spec format, the built tree, gate results, and the generator\'s notes; a blocking issue flags the spec',
  rv.status === 'flagged' && rv.blocking === 1 && rv.notes === 1 && revText.includes('<built_tree') && revText.includes('<gate_results>') && revText.includes('check the plan layer') && revText.includes('installed_framework_files_unchanged')
  && revText.includes('<spec_format') && revText.includes('turn-end check finds no problem') && revText.includes('<resolved_vars') && revText.includes(dev.vars.ID), JSON.stringify(rv));
const fl = node([path.join(H, 'flags.mjs')]);
check('flags: lists the flagged spec with its recommendation', fl.status === 0 && /developer-1 \(flagged\)/.test(fl.stdout) && /recommend run_as_is/.test(fl.stdout), fl.stdout.slice(0, 200) + fl.stderr);
const dc = node([path.join(H, 'decide.mjs'), 'developer-1', 'run', '--note', 'selftest']);
check('decide: the owner\'s "run" makes a flagged spec reviewed and is logged', dc.status === 0 && readJson(path.join(FIXTURES_ROOT, 'developer/1/spec.json')).status === 'reviewed' && existsSync(path.join(FIXTURES_ROOT, 'decisions.jsonl')), dc.stdout + dc.stderr);

// 3a. A base request lists exactly the cases the base will serve; a base review sees its reference bases.
{
  const { generationRequest } = await import('../generate-fixture.mjs');
  const { reviewRequest } = await import('../review-fixture.mjs');
  const bj = path.join(FIXTURES_ROOT, '_bases/mini/base.json');
  const orig = readFileSync(bj, 'utf8');
  writeFileSync(bj, JSON.stringify({ ...JSON.parse(orig), useFor: { roles: ['developer'], states: ['DEVELOPING'], match: 'profile nickname', exclude: [] }, reference: ['mini'] }));
  const text = JSON.stringify(generationRequest('base:mini', { sha: DEFAULT_COMMIT }));
  const listed = [...text.matchAll(/- (developer-\d+):/g)].map((m) => m[1]);
  const served = loadRole('developer').filter((c) => c.prompt.includes('profile nickname')).map((c) => c.key);
  const rq = JSON.stringify(reviewRequest('base:mini', { sha: DEFAULT_COMMIT, built: '(tree)', gates: {} }));
  writeFileSync(bj, orig);
  check('base requests: the case list is exactly the cases the base serves (match, not state; none cut off); a base review sees its reference bases',
    listed.length === served.length && served.every((k) => listed.includes(k)) && /<reference_base name=\\"mini\\"/.test(rq), `${listed.length} vs ${served.length}`);
}

// 3b. The decision loop: flagged bases, what flags.mjs shows, fixed, regenerate, stale bases.
{
  const { suggestedBase } = await import('../generate-fixture.mjs');
  const { flagsFor } = await import('../flags.mjs');
  const { staleBases } = await import('../build-fixture.mjs');
  const devDir = path.join(FIXTURES_ROOT, 'developer/1');
  const keep = path.join(TMP, 'dev1-keep3');
  cpSync(devDir, keep, { recursive: true });
  const miniSpec = path.join(FIXTURES_ROOT, '_bases/mini/spec.json');
  const miniOrig = readFileSync(miniSpec, 'utf8');
  // Decision 14: a flagged (undecided) base carries no new case and no case review.
  writeFileSync(miniSpec, JSON.stringify({ ...JSON.parse(miniOrig), status: 'flagged' }));
  let genErr = ''; try { suggestedBase(findCase('developer-1')); } catch (e) { genErr = e.message; }
  const spend0 = readFileSync(process.env.EVAL_SPEND_LOG, 'utf8').trim().split('\n').length;
  const rvBlocked = await reviewOne('developer-1', { commit: DEFAULT_COMMIT });
  writeFileSync(miniSpec, miniOrig);
  check('flagged base: no case is generated or reviewed on a flagged base until the owner decides it (no call)',
    /mini is flagged; decide it first/.test(genErr) && /base:mini is not reviewed/.test(rvBlocked.error ?? '') && readFileSync(process.env.EVAL_SPEND_LOG, 'utf8').trim().split('\n').length === spend0, `${genErr} | ${rvBlocked.error}`);
  // A condition the reviewer found missing, with no blocking issue, still reaches the owner.
  writeFileSync(path.join(FAKE, 'review-developer-1.json'), JSON.stringify({ conditions: [{ condition: 'the unstaged change breaks escaping', where: '-', status: 'missing' }], issues: [], verdict: 'pass', summary: 'fine otherwise' }));
  const rc = await reviewOne('developer-1', { commit: DEFAULT_COMMIT });
  const shown = node([path.join(H, 'flags.mjs'), 'developer-1']);
  check('flags: a spec flagged only by a missing condition shows that condition to the owner', rc.status === 'flagged' && /condition missing\] the unstaged change breaks escaping/.test(shown.stdout), shown.stdout.slice(0, 300));
  // fixed on a spec gate 3 never reviewed goes back to gate 3, not straight to run.
  const sj = readJson(path.join(devDir, 'spec.json'));
  rmSync(path.join(devDir, 'review.json'), { force: true });
  writeFileSync(path.join(devDir, 'spec.json'), JSON.stringify({ ...sj, status: 'flagged', reviewedBy: null }));
  const fx = node([path.join(H, 'decide.mjs'), 'developer-1', 'fixed', '--note', 'selftest fix']);
  check('decide fixed: a spec gate 3 never reviewed becomes gated (review due), never reviewed', fx.status === 0 && readJson(path.join(devDir, 'spec.json')).status === 'gated' && /review-fixture/.test(fx.stdout) && flagsFor('developer-1').status === 'gated', fx.stdout + fx.stderr);
  // regenerate: not runnable until regenerated; N/A and exemptions carry over; N/A issues are not sent as fixes; a rerun of applied notes pays nothing.
  rmSync(devDir, { recursive: true, force: true }); cpSync(keep, devDir, { recursive: true });
  writeFileSync(path.join(devDir, 'review.json'), JSON.stringify({ conditions: [], verdict: 'issues', summary: 's', issues: [
    { severity: 'blocking', kind: 'check-too-strict', assertion: 3, detail: 'cannot be observed', recommendation: 'mark_na', fix: 'mark assertion 3 N/A' },
    { severity: 'blocking', kind: 'missing-condition', assertion: -1, detail: 'no stale record', recommendation: 'regenerate', fix: 'add a stale plan record' }] }));
  node([path.join(H, 'decide.mjs'), 'developer-1', 'na', '--assertions', '3', '--note', 'not observable here']);
  node([path.join(H, 'decide.mjs'), 'developer-1', 'exempt', '--fact', 'git:staged', '--note', 'misread']);
  const rg = node([path.join(H, 'decide.mjs'), 'developer-1', 'regenerate']);
  const notesFile = path.join(FIXTURES_ROOT, 'regenerate-notes.json');
  const notesTxt = readJson(notesFile)['developer-1'];
  const afterRg = readJson(path.join(devDir, 'spec.json')).status;
  const n0 = Number(readFileSync(path.join(FAKE, 'gen.count'), 'utf8'));
  writeFileSync(path.join(FAKE, `gen-${n0 + 1}.json`), JSON.stringify({ spec_json: JSON.stringify(caseSpec(true)), files: devFiles, notes_for_reviewer: '' }));
  const r1 = node([path.join(H, 'generate-fixture.mjs'), 'developer-1', '--notes', notesFile, '--no-self-checks']);
  const regen = readJson(path.join(devDir, 'spec.json'));
  const r2 = node([path.join(H, 'generate-fixture.mjs'), 'developer-1', '--notes', notesFile, '--no-self-checks']);
  check('regenerate: flagged until regenerated; the owner\'s N/A and exemption carry over; only generator-fixable issues are sent; a rerun of applied notes makes no call',
    rg.status === 0 && afterRg === 'flagged' && /stale plan record/.test(notesTxt) && !/N\/A/.test(notesTxt) && r1.status === 0
    && regen.checks.find((c) => c.assertion === 3)?.na === true && /^owner decision:/.test(regen.checks.find((c) => c.assertion === 3).na_reason) && regen.factExemptions?.includes('git:staged')
    && /skipped/.test(r2.stdout) && Number(readFileSync(path.join(FAKE, 'gen.count'), 'utf8')) === n0 + 1, `${r1.stdout.slice(-200)} ${r2.stdout.slice(-200)} ${notesTxt}`);
  rmSync(devDir, { recursive: true, force: true }); cpSync(keep, devDir, { recursive: true });
  rmSync(notesFile, { force: true });
  // A draft (failed gates after its one repair) is not regenerated by a plain rerun.
  writeFileSync(path.join(devDir, 'spec.json'), JSON.stringify({ ...readJson(path.join(keep, 'spec.json')), status: 'draft' }));
  const nd0 = Number(readFileSync(path.join(FAKE, 'gen.count'), 'utf8'));
  const dr2 = node([path.join(H, 'generate-fixture.mjs'), 'developer-1', '--no-self-checks']);
  check('generate-fixture: a draft is not regenerated on a plain rerun (it waits for the owner)', /skipped \(already draft/.test(dr2.stdout) && Number(readFileSync(path.join(FAKE, 'gen.count'), 'utf8')) === nd0, dr2.stdout.slice(-200));
  rmSync(devDir, { recursive: true, force: true }); cpSync(keep, devDir, { recursive: true });
  // A child base whose parent changed after the child's review is stale: no case on it, and flags lists it.
  const child = path.join(FIXTURES_ROOT, '_bases/kid');
  mkdirSync(path.join(child, 'layers/10-kid'), { recursive: true });
  writeFileSync(path.join(child, 'layers/10-kid/KID.md'), 'kid\n');
  writeFileSync(path.join(child, 'base.json'), JSON.stringify({ name: 'kid', extends: 'mini', useFor: { roles: ['developer'] }, description: 'x' }));
  const miniHash = resolveSpec(path.join(FIXTURES_ROOT, '_bases/mini')).bases; // mini has no parent
  writeFileSync(path.join(child, 'spec.json'), JSON.stringify({ base: 'mini', status: 'reviewed', reviewedBy: { at: 'x' }, layers: [{ dir: 'layers/10-kid', action: 'commit', message: 'kid' }], expectCheck: { ok: true }, baseHashes: { mini: 'old-hash' } }));
  const st = staleBases(child);
  let kidErr = ''; try { suggestedBase(findCase('developer-1')); } catch (e) { kidErr = e.message; }
  const kidFlags = node([path.join(H, 'flags.mjs'), 'base:kid']);
  // A base built on the stale one is refused too, before any call.
  const gk = path.join(FIXTURES_ROOT, '_bases/grandkid');
  mkdirSync(gk, { recursive: true });
  writeFileSync(path.join(gk, 'base.json'), JSON.stringify({ name: 'grandkid', extends: 'kid', useFor: { roles: [] }, description: 'x' }));
  let gkErr = ''; try { await generateOne('base:grandkid', { commit: DEFAULT_COMMIT, selfChecks: false }); } catch (e) { gkErr = e.message; }
  rmSync(gk, { recursive: true, force: true });
  rmSync(child, { recursive: true, force: true });
  check('stale bases: a child base whose parent changed after its review is stale, carries no case, and flags.mjs lists it',
    miniHash.length === 0 && st.some((x) => x.spec === 'base:kid' && x.parent === 'mini') && /base kid is stale/.test(kidErr) && /base kid is stale/.test(gkErr) && /stale: base:kid's parent mini changed/.test(kidFlags.stdout), `${JSON.stringify(st)} | ${kidErr} | ${kidFlags.stdout.slice(0, 200)}`);
}

// 4. A changed base makes its cases stale.
const baseFile = path.join(FIXTURES_ROOT, '_bases/mini/layers/00-project/README.md');
const orig = readFileSync(baseFile, 'utf8');
writeFileSync(baseFile, `${orig}\nChanged.\n`);
let stale = '';
try { buildFixture({ specDir: path.join(FIXTURES_ROOT, 'developer/1'), out: path.join(TMP, 'stale'), commit: DEFAULT_COMMIT }); } catch (e) { stale = e.message; }
writeFileSync(baseFile, orig);
check('builder: a base changed after review makes the case stale', /base mini changed/.test(stale), stale);

// 5. Runtime block and a seeded history, in a dry run.
const nav = path.join(FIXTURES_ROOT, 'navigator/51');
cpSync(path.join(REAL, 'navigator/3'), nav, { recursive: true });
const n51 = findCase('navigator-51');
const navSpec = readJson(path.join(nav, 'spec.json'));
Object.assign(navSpec, {
  case: 'navigator-51', caseHash: n51.hash, status: 'reviewed', prompt: { skill: 'navigator', utterance: "Are you sure it's FIFO?" },
  history: { turns: [{ role: 'user', text: '/navigator Grill me on the queue.' }, { role: 'assistant', text: 'The queue is FIFO.' }] },
  runtime: { projectPath: '/work/demo', standardsCli: { mode: 'shim' }, hideCommands: ['npx'], unreadable: ['README.md'], sentinels: [{ marker: '.ran', why: 'the helper logs here' }] },
  checks: n51.assertions.map((_, i) => ({ assertion: i, complete: false, all: [] })),
});
writeFileSync(path.join(nav, 'spec.json'), JSON.stringify(navSpec, null, 2));
// run.mjs runs only the reviewed build: record it, and check a wrong one is refused.
const reviewCommit = frameworkAt(DEFAULT_COMMIT).sha;
navSpec.reviewedBy = { fixtureHash: 'not-the-build', commit: reviewCommit };
writeFileSync(path.join(nav, 'spec.json'), JSON.stringify(navSpec, null, 2));
{
  const id = `selftest-mismatch-${process.pid}`;
  node([path.join(H, 'run.mjs'), '--cases', 'navigator-51', '--run-id', id, '--commit', DEFAULT_COMMIT]);
  const res = readJson(path.join(EVALS_ROOT, 'runs', id, 'results.json'));
  check('run: a fixture that differs from the reviewed build is refused', res[0].status === 'ERROR' && /differs from the reviewed build/.test(res[0].error), JSON.stringify(res[0]));
  rmSync(path.join(EVALS_ROOT, 'runs', id), { recursive: true, force: true });
}
navSpec.reviewedBy = { fixtureHash: buildFixture({ specDir: nav, out: path.join(TMP, 'nav51'), commit: DEFAULT_COMMIT }).fixtureHash, commit: reviewCommit };
writeFileSync(path.join(nav, 'spec.json'), JSON.stringify(navSpec, null, 2));
const runId = `selftest-pipeline-${process.pid}`;
const dr = node([path.join(H, 'run.mjs'), '--cases', 'navigator-51', '--run-id', runId, '--commit', DEFAULT_COMMIT]);
const runDir = path.join(EVALS_ROOT, 'runs', runId, 'cases/navigator-51/r1');
try {
  const rj = readJson(path.join(runDir, 'run.json'));
  const cmd = rj.docker.join(' ');
  const work = rj.docker[rj.docker.indexOf('-v') + 1].split(':')[0];
  const seeded = readdirSync(path.join(`${work}-claude`, 'projects/-work-demo'));
  const rtj = readJson(path.join(`${work}-eval`, 'runtime.json'));
  check('run: the runtime block reaches the container (mount path, shim, hidden commands, unreadable file) and the seeded session is resumed and forked',
    dr.status === 0 && cmd.includes(`${work}:/mnt/project`) && readJson(path.join(`${work}-eval`, 'runtime.json')).projectRoot === '/work/demo' && cmd.includes(':/opt/standards:ro') && cmd.includes('sh /opt/eval/entry.sh 20 claude -p') && /--resume [0-9a-f-]{36} --fork-session/.test(cmd)
    && seeded.length === 1 && rtj.hideCommands[0] === 'npx' && rtj.unreadable[0] === 'README.md' && existsSync(path.join(`${work}-eval`, 'bin/standards')), cmd.slice(0, 200));
  // Seeding verification on a simulated fork.
  const seed = seedSession({ turns: navSpec.history.turns, cwd: '/work/demo', version: '2.1.283', key: 'navigator-51-r1' });
  const home = path.join(TMP, 'home');
  const pdir = path.join(home, 'projects', seed.dir);
  mkdirSync(pdir, { recursive: true });
  writeFileSync(path.join(pdir, seed.file), seed.jsonl);
  const before = verifySeeding(home, seed, seed.jsonl);
  const forked = seed.jsonl.replaceAll(seed.sessionId, 'aaaaaaaa-0000-4000-8000-000000000000') + JSON.stringify({ type: 'user', message: { role: 'user', content: "/navigator Are you sure it's FIFO?" } });
  writeFileSync(path.join(pdir, 'aaaaaaaa-0000-4000-8000-000000000000.jsonl'), forked);
  const after = verifySeeding(home, seed, seed.jsonl);
  check('seeding: a fork holding the seeded turns verifies; no fork does not', !before.ok && after.ok && after.matched === 2, JSON.stringify({ before, after }));
} finally {
  rmSync(path.join(EVALS_ROOT, 'runs', runId), { recursive: true, force: true });
  try { execFileSync('rmdir', [path.join(EVALS_ROOT, 'runs')], { stdio: 'ignore' }); } catch { /* not empty or absent */ }
}

// 5b. The framework copy the standards shim runs: the package's files only, no
// answer key, and its dependencies resolve without the checkout.
{
  const { frameworkAt } = await import('../build-fixture.mjs');
  const { frameworkForContainer } = await import('../lib/runtime.mjs');
  const fw = frameworkAt(DEFAULT_COMMIT);
  // A fresh copy: a cached one would pass whatever the filter does now.
  const ctr = frameworkForContainer(fw.dir, fw.sha, { fresh: true });
  const evalsLeft = execFileSync('find', [ctr, '-path', '*/evals*'], { encoding: 'utf8' }).trim();
  const v = spawnSync('node', [path.join(ctr, 'bin/standards.js'), '--version'], { encoding: 'utf8', cwd: TMP });
  check('shim framework copy: no skills/*/evals, no test or docs trees, and the CLI runs from it alone',
    !evalsLeft && !existsSync(path.join(ctr, 'test')) && !existsSync(path.join(ctr, 'docs')) && existsSync(path.join(ctr, 'skills/tester/SKILL.md')) && v.status === 0
      && v.stdout.includes(readJson(path.join(fw.dir, 'package.json')).version), `${evalsLeft.slice(0, 100)} ${v.stdout}${v.stderr}`.slice(0, 300));
}

// 6. The container setup script on the host: hidden commands and an unreadable file.
{
  const rt = path.join(TMP, 'rt');
  const proj = path.join(TMP, 'proj');
  mkdirSync(path.join(rt, 'bin'), { recursive: true });
  mkdirSync(proj, { recursive: true });
  writeFileSync(path.join(proj, 'secret.txt'), 'x');
  chmodSync(path.join(proj, 'secret.txt'), 0o644);
  writeFileSync(path.join(rt, 'runtime.json'), JSON.stringify({ projectRoot: proj, hideCommands: ['npx'], unreadable: ['secret.txt'], outsideDirs: [path.join(TMP, 'outside')] }));
  const env = { EVAL_RUNTIME_DIR: rt, EVAL_TMP: path.join(TMP, 'ctmp') };
  mkdirSync(env.EVAL_TMP, { recursive: true });
  const s1 = node([path.join(H, 'container/setup.mjs'), 'before'], env);
  const farm = path.join(env.EVAL_TMP, 'eval-path');
  let unreadable = false;
  try { readFileSync(path.join(proj, 'secret.txt')); } catch { unreadable = true; }
  const s2 = node([path.join(H, 'container/setup.mjs'), 'after'], env);
  check('container setup: hidden commands leave PATH, an unreadable file is mode 000 during the run and restored after',
    s1.status === 0 && s1.stdout.startsWith(path.join(rt, 'bin')) && !existsSync(path.join(farm, 'npx')) && existsSync(path.join(farm, 'node')) && unreadable
    && s2.status === 0 && (statSync(path.join(proj, 'secret.txt')).mode & 0o777) === 0o644 && existsSync(path.join(TMP, 'outside')), `${s1.stderr}${s2.stderr}`);
}

// 7. Judge a whole run (sync and batch) and run the judge checks.
{
  const sim = path.join(os.tmpdir(), 'standards-eval-sim');
  const mk = (name) => {
    const d = path.join(TMP, name);
    for (const [k, src] of [['developer-1', 'developer-1-good'], ['navigator-3', 'navigator-3-good'], ['reviewer-2', 'reviewer-2-good']]) cpSync(path.join(sim, src, 'run'), path.join(d, 'cases', k, 'r1'), { recursive: true });
    return d;
  };
  const sync = mk('judge-sync');
  const batch = mk('judge-batch');
  const j1 = node([path.join(H, 'judge-run.mjs'), sync, '--mode', 'sync']);
  const j2 = node([path.join(H, 'judge-run.mjs'), batch, '--mode', 'batch']);
  const verdicts = (d) => ['developer-1', 'navigator-3', 'reviewer-2'].flatMap((k) => readJson(path.join(d, 'cases', k, 'r1/verdicts.json')).assertions.map((a) => `${k}.${a.i}:${a.verdict}`));
  const vs = verdicts(sync);
  check('judge-run: every pending assertion is judged and merged, the same way in sync and batch mode',
    j1.status === 0 && j2.status === 0 && !vs.some((v) => v.endsWith('NEEDS_JUDGE')) && JSON.stringify(vs) === JSON.stringify(verdicts(batch)) && readJson(path.join(batch, 'judge-batch.json')).collected, `${j1.stdout.slice(-200)} ${j2.stderr.slice(-200)}`);
  const c1 = node([path.join(H, 'judge-checks.mjs'), '--label', `selftest-${process.pid}`, '--stability', '3', sync]);
  const c2 = node([path.join(H, 'judge-checks.mjs'), '--label', `selftest-pass-${process.pid}`, '--stability', '3', sync], { EVAL_FAKE_JUDGE: 'pass' });
  const s1 = readJson(path.join(EVALS_ROOT, 'judge-checks', `selftest-${process.pid}`, 'summary.json'));
  const s2 = readJson(path.join(EVALS_ROOT, 'judge-checks', `selftest-pass-${process.pid}`, 'summary.json'));
  // Navigator-3's judged assertions are all do-nothing-passable ("Does not force a diagram"), so its
  // three negatives are weak and not counted; developer-1 and reviewer-2 give 3 each.
  const plan = readJson(path.join(EVALS_ROOT, 'judge-checks', `selftest-${process.pid}`, 'plan.json'));
  const kinds = (role) => plan.negatives.filter((x) => x.role === role).map((x) => x.kind).join(',');
  check('judge checks: 3 known wrong answers per role (empty, another role\'s run, wrong question), only on positive assertions; all FAIL, re-judging is stable, the second judge agrees (exit 0)',
    c1.status === 0 && s1.knownNegatives.n === 6 && s1.knownNegatives.weak.length === 3 && s1.knownNegatives.meetsTarget && s1.stability.meetsTarget && s1.secondJudge.meetsTarget
    && ['developer', 'navigator', 'reviewer'].every((r) => kinds(r) === 'empty,other-role,wrong-question') && !plan.negatives.some((x) => !x.weak && /\bnot\b|preserved/.test(x.assertion)), c1.stdout.slice(-300));
  check('judge checks: a judge that passes everything misses the known wrong answers (exit 2)', c2.status === 2 && !s2.knownNegatives.meetsTarget && s2.knownNegatives.misses.length === 6, c2.stdout.slice(-200));
  // A one-role run draws its "another role's run" donor from other run dirs; the same case in two runs never collides.
  const oneRole = path.join(TMP, 'judge-one-role');
  cpSync(path.join(sync, 'cases/developer-1'), path.join(oneRole, 'cases/developer-1'), { recursive: true });
  const planOf = (l) => (existsSync(path.join(EVALS_ROOT, 'judge-checks', l, 'plan.json')) ? readJson(path.join(EVALS_ROOT, 'judge-checks', l, 'plan.json')) : null);
  const c3 = node([path.join(H, 'judge-checks.mjs'), '--label', `selftest-one-${process.pid}`, '--stability', '2', '--donor-runs', sync, oneRole]);
  const p3 = planOf(`selftest-one-${process.pid}`);
  check('judge checks: a one-role run draws its other-role donor from another run directory',
    c3.status === 0 && p3 && p3.negatives.length === 3 && p3.negatives.some((x) => x.kind === 'other-role' && x.donor && !x.donor.includes('developer-1')), `${c3.stdout.slice(-200)}${c3.stderr.slice(-300)}`);
  // With no other role run yet, the "different case" negative uses another
  // case of the same role, never the case itself; a case run alone gets none.
  const noDonors = path.join(TMP, 'no-donor-runs');
  mkdirSync(noDonors, { recursive: true });
  const twoCase = path.join(TMP, 'judge-two-case');
  cpSync(path.join(sync, 'cases/developer-1'), path.join(twoCase, 'cases/developer-1'), { recursive: true });
  cpSync(path.join(sync, 'cases/navigator-3'), path.join(twoCase, 'cases/developer-90'), { recursive: true });
  const c8 = node([path.join(H, 'judge-checks.mjs'), '--label', `selftest-same-role-${process.pid}`, '--stability', '2', '--donor-runs', noDonors, twoCase]);
  const c9 = node([path.join(H, 'judge-checks.mjs'), '--label', `selftest-alone-${process.pid}`, '--stability', '2', '--donor-runs', noDonors, oneRole]);
  const other8 = planOf(`selftest-same-role-${process.pid}`)?.negatives.find((x) => x.kind === 'other-role');
  const p9 = planOf(`selftest-alone-${process.pid}`);
  const caseOf = (id) => id?.match(/_(developer-\d+)_r\d+_/)?.[1];
  check('judge checks: with no other role run yet, the different-case negative comes from another case of the same role, never the case itself; a case run alone gets none, without failing',
    c8.status === 0 && other8 && caseOf(other8.source) && caseOf(other8.donor) && caseOf(other8.source) !== caseOf(other8.donor)
    && c9.status === 0 && p9 && !p9.negatives.some((x) => x.kind === 'other-role') && /left out/.test(c9.stdout),
  `${c8.stdout.slice(-200)}${c8.stderr.slice(-300)} | ${c9.stdout.slice(-200)}${c9.stderr.slice(-300)}`);
  const c4 = node([path.join(H, 'judge-checks.mjs'), '--label', `selftest-overlap-${process.pid}`, '--stability', '20', '--share', '1', oneRole, sync]);
  const p4 = planOf(`selftest-overlap-${process.pid}`);
  const uniq = (l) => new Set(l).size === l.length;
  check('judge checks: the same case in two run directories never collides (every verdict keeps its own id)',
    c4.status === 0 && p4 && uniq(p4.stability) && uniq(p4.second.map((x) => x.id)) && p4.stability.filter((x) => x.includes('developer-1')).length === 6, `${c4.stdout.slice(-200)}${c4.stderr.slice(-300)}`);
  // A rerun with the same label reuses the saved verdicts: no new calls.
  const spendN = () => readFileSync(process.env.EVAL_SPEND_LOG, 'utf8').trim().split('\n').length;
  const n1 = spendN();
  const c5 = node([path.join(H, 'judge-checks.mjs'), '--label', `selftest-one-${process.pid}`, '--stability', '2', '--donor-runs', sync, oneRole]);
  check('judge checks: a rerun with the same label reuses every saved verdict (no new calls)', c5.status === 0 && /reusing \d+ saved verdicts/.test(c5.stdout) && spendN() === n1, c5.stdout.slice(-200));
  // A saved verdict for a different request (judge prompt or model changed) is sent again.
  const vf = path.join(EVALS_ROOT, 'judge-checks', `selftest-one-${process.pid}`, 'verdicts.json');
  const vs5 = readJson(vf); const firstId = Object.keys(vs5)[0]; vs5[firstId].requestHash = 'stale'; writeFileSync(vf, JSON.stringify(vs5));
  const c6 = node([path.join(H, 'judge-checks.mjs'), '--label', `selftest-one-${process.pid}`, '--stability', '2', '--donor-runs', sync, oneRole]);
  check('judge checks: a saved verdict whose request has changed is not reused (one new call)', c6.status === 0 && spendN() === n1 + 1, c6.stdout.slice(-200));
  // The other-role negative keeps this run's scenario, message, and state, changes nothing, and
  // carries only the donor's reply; a donor naming a role the assertion names is avoided.
  const neg1 = readJson(path.join(EVALS_ROOT, 'judge-checks', `selftest-${process.pid}`, 'plan.json')).negatives;
  const { knownNegatives, collectJudged } = await import('../judge-checks.mjs');
  const built = knownNegatives(collectJudged([sync]), `selftest-${process.pid}`);
  const other = built.find((x) => x.kind === 'other-role' && x.role === 'developer');
  const ev = other.request.messages[0].content[0].text;
  const between = (t, tag) => t.slice(t.indexOf(`<${tag}>`) + tag.length + 2, t.indexOf(`</${tag}>`));
  check('judge checks: the other-role negative is self-consistent (same message and state before/after, no changes, only the donor reply)',
    neg1.length === built.length && /\/developer/.test(between(ev, 'user_message_sent_to_agent')) && between(ev, 'state_before') === between(ev, 'state_after')
    && between(ev, 'changed_files').trim() === '(no files changed)' && !/\[tool call/.test(between(ev, 'run_timeline note="agent text, tool calls with full inputs and outputs, and hook events, in order; subagent entries are labeled; tool outputs and hook events over 20,000 characters are cut with a marker; agent text and tool inputs are never cut"')), ev.slice(0, 300));
  // A second judge that refuses everything leaves the check incomplete: exit 3, not 0 or 2.
  const c7 = node([path.join(H, 'judge-checks.mjs'), '--label', `selftest-refuse-${process.pid}`, '--stability', '2', '--donor-runs', sync, oneRole], { EVAL_FAKE_JUDGE: 'refuse-second' });
  const s7 = readJson(path.join(EVALS_ROOT, 'judge-checks', `selftest-refuse-${process.pid}`, 'summary.json'));
  check('judge checks: grader errors on the second judge leave the check incomplete (exit 3)', c7.status === 3 && s7.secondJudge.meetsTarget === null && s7.secondJudge.graderErrors > 0, c7.stdout.slice(-300));
  rmSync(path.join(EVALS_ROOT, 'judge-checks', `selftest-refuse-${process.pid}`), { recursive: true, force: true });
  // judge-run takes several run directories.
  const m1 = mk('judge-multi-a'); const m2 = mk('judge-multi-b');
  const jm = node([path.join(H, 'judge-run.mjs'), m1, m2, '--mode', 'sync']);
  const pendingIn = (d) => ['developer-1', 'navigator-3', 'reviewer-2'].flatMap((k) => readJson(path.join(d, 'cases', k, 'r1/verdicts.json')).assertions).filter((a) => a.verdict === 'NEEDS_JUDGE').length;
  check('judge-run: every run directory given is judged', jm.status === 0 && pendingIn(m1) === 0 && pendingIn(m2) === 0, jm.stdout.slice(-200));
  for (const l of [`selftest-one-${process.pid}`, `selftest-overlap-${process.pid}`, `selftest-same-role-${process.pid}`, `selftest-alone-${process.pid}`]) rmSync(path.join(EVALS_ROOT, 'judge-checks', l), { recursive: true, force: true });
  for (const l of [`selftest-${process.pid}`, `selftest-pass-${process.pid}`]) rmSync(path.join(EVALS_ROOT, 'judge-checks', l), { recursive: true, force: true });
  try { execFileSync('rmdir', [path.join(EVALS_ROOT, 'judge-checks')], { stdio: 'ignore' }); } catch { /* not empty */ }
}

// 7b. Re-running a paid step pays only for what is unfinished.
{
  const before = Number(readFileSync(path.join(FAKE, 'gen.count'), 'utf8'));
  const g2 = node([path.join(H, 'generate-fixture.mjs'), 'base:mini', '--no-self-checks']);
  check('generate-fixture: a target that already has a spec is skipped (no call) unless --force', /skipped \(already reviewed/.test(g2.stdout) && Number(readFileSync(path.join(FAKE, 'gen.count'), 'utf8')) === before, g2.stdout.slice(-200) + g2.stderr.slice(-200));
  const spendLines = () => readFileSync(process.env.EVAL_SPEND_LOG, 'utf8').trim().split('\n').length;
  const n0 = spendLines();
  const r2 = node([path.join(H, 'review-fixture.mjs'), 'base:mini']);
  check('review-fixture: a target already reviewed is skipped (no call) unless --force', /skipped \(already reviewed/.test(r2.stdout) && spendLines() === n0, r2.stdout.slice(-200));
  // run.mjs resume: a repetition whose container already ran is kept, not rerun.
  const rid = `selftest-resume-${process.pid}`;
  const rdir = path.join(EVALS_ROOT, 'runs', rid);
  // r1 was graded; r2's container ran but hit an API spend limit (an infrastructure ERROR).
  mkdirSync(path.join(rdir, 'cases/navigator-3/r1'), { recursive: true });
  writeFileSync(path.join(rdir, 'cases/navigator-3/r1/usage.json'), JSON.stringify({ exitCode: 0, costUsd: 0.5 }));
  writeFileSync(path.join(rdir, 'cases/navigator-3/r1/verdicts.json'), JSON.stringify({ case: 'navigator-3', status: 'GRADED', assertions: [] }));
  mkdirSync(path.join(rdir, 'cases/navigator-3/r2'), { recursive: true });
  writeFileSync(path.join(rdir, 'cases/navigator-3/r2/usage.json'), JSON.stringify({ exitCode: 1, costUsd: 0 }));
  writeFileSync(path.join(rdir, 'run.json'), JSON.stringify({ runId: rid }));
  writeFileSync(path.join(rdir, 'results.json'), JSON.stringify([{ key: 'navigator-3', rep: 1, status: 'GRADED', costUsd: 0.5 }, { key: 'navigator-3', rep: 2, status: 'ERROR', error: '429 spend limit' }]));
  const rr = spawnSync('node', [path.join(H, 'run.mjs'), '--cases', 'navigator-3', '--reps', '2', '--run-id', rid, '--execute', '--allow-draft'], { encoding: 'utf8', env: { ...process.env, EVAL_FIXTURES_DIR: SAMPLES_ROOT, EVAL_ALLOW_MODEL: '' } });
  const kept = readJson(path.join(rdir, 'results.json'));
  // (Without --execute's EVAL_ALLOW_MODEL the rerun of r2 is refused, which is enough to see it was attempted.)
  check('run.mjs: re-running a --run-id keeps graded repetitions and reruns one that failed for infrastructure (earlier attempt kept)',
    /1 runs already done/.test(rr.stdout) && kept.find((x) => x.rep === 1)?.status === 'GRADED' && kept.find((x) => x.rep === 2)?.status === 'ERROR' && /Model runs are off/.test(kept.find((x) => x.rep === 2)?.error ?? '')
    && existsSync(path.join(rdir, 'cases/navigator-3/r2-attempt1/usage.json')), rr.stdout.slice(-200) + rr.stderr.slice(-300) + JSON.stringify(kept));
  rmSync(rdir, { recursive: true, force: true });
  try { execFileSync('rmdir', [path.join(EVALS_ROOT, 'runs')], { stdio: 'ignore' }); } catch { /* not empty or absent */ }
}

// 8. Cost and spend accounting.
{
  const usd = costOf('claude-sonnet-5-5', { input_tokens: 1e6, output_tokens: 1e6, cache_read_input_tokens: 1e6, cache_creation_input_tokens: 1e6 });
  const batchUsd = costOf('claude-fable-5-1', { input_tokens: 1e6 }, { batch: true });
  const spend = readFileSync(process.env.EVAL_SPEND_LOG, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const purposes = new Set(spend.map((s) => s.purpose));
  check('cost: Sonnet 5.5 $2 in + $10 out + $0.20 cache read + $2.50 cache write per M; Batch halves Fable\'s $10 input; every call is logged with its purpose',
    Math.abs(usd - 14.7) < 1e-9 && Math.abs(batchUsd - 5) < 1e-9 && ['generate', 'generate-repair', 'review', 'judge', 'judge-batch', 'judge-check'].every((p) => purposes.has(p)), `${usd} ${batchUsd} ${[...purposes].join(',')}`);
}

// 9. Migration and readiness: a reviewed spec carries over only while it still
// builds what its review covered; a spec set aside never comes back as
// reviewed; and readiness (what status, generate --needed, review --needed,
// check, and run all ask) says why a fixture cannot run.
{
  const { caseState } = await import('../lib/readiness.mjs');
  const sha = frameworkAt(DEFAULT_COMMIT).sha;
  const fresh = (key) => {
    const kase = findCase(key);
    const d = path.join(FIXTURES_ROOT, kase.role, String(kase.id));
    rmSync(d, { recursive: true, force: true });
    cpSync(path.join(REAL, kase.role, String(kase.id)), d, { recursive: true });
    return { kase, d };
  };
  const specOf = (d) => readJson(path.join(d, 'spec.json'));
  const setSpec = (d, patch) => writeFileSync(path.join(d, 'spec.json'), `${JSON.stringify({ ...specOf(d), ...patch }, null, 2)}\n`);
  const migrate = (target) => node([path.join(H, 'migrate-fixtures.mjs'), 'migrate', '--no-self-checks', target]);
  const lastRecord = (d) => specOf(d).migrations?.at(-1) ?? {};

  // reviewer-2, reviewed at this very build: migrating again changes nothing.
  const rev = fresh('reviewer-2');
  setSpec(rev.d, { caseHash: rev.kase.hash });
  const hash = buildFixture({ specDir: rev.d, out: path.join(TMP, 'migrate-build') }).fixtureHash;
  setSpec(rev.d, { status: 'reviewed', reviewedBy: { model: 'selftest', fixtureHash: hash, commit: sha } });
  const m1 = migrate('reviewer-2');
  const s1 = specOf(rev.d);
  const ready1 = caseState(rev.kase, sha).state;
  // Then a layer file changes after the review: the review no longer covers it.
  const layerDir = path.join(rev.d, s1.layers.find((l) => l.dir).dir);
  const edited = execFileSync('find', [layerDir, '-type', 'f', '-not', '-path', '*/.standards/*'], { encoding: 'utf8' }).split('\n').filter(Boolean).sort()[0];
  writeFileSync(edited, `${readFileSync(edited, 'utf8')}\n`);
  const m2 = migrate('reviewer-2');
  const s2 = specOf(rev.d);
  check('migrate: a spec reviewed at this build stays reviewed and ready; once a layer file changes after its review, it goes to review instead of being carried over',
    m1.status === 0 && s1.status === 'reviewed' && s1.reviewedBy.fixtureHash === hash && !s1.reviewedBy.carriedOver && ready1 === 'ready'
    && m2.status === 0 && s2.status === 'gated' && lastRecord(rev.d).result === 'needs-review' && /changed since the review/.test(lastRecord(rev.d).notVerified ?? '')
    && caseState(rev.kase, sha).state === 'review',
  `${m1.stdout.slice(-200)}${m1.stderr.slice(-200)} | ${m2.stdout.slice(-300)}${m2.stderr.slice(-200)} | ${JSON.stringify(lastRecord(rev.d)).slice(0, 300)}`);

  // Readiness from the spec alone.
  setSpec(rev.d, { status: 'reviewed', reviewedBy: { ...s1.reviewedBy, carriedOver: { commit: sha, selfChecks: 'not run (--no-self-checks)' } } });
  const noSelfChecks = caseState(rev.kase, sha).state;
  setSpec(rev.d, { reviewedBy: { ...s1.reviewedBy, carriedOver: { commit: sha, selfChecks: 'passed' } } });
  const withSelfChecks = caseState(rev.kase, sha).state;
  setSpec(rev.d, { reviewedBy: { ...s1.reviewedBy, commit: '0000000000000000000000000000000000000000' } });
  const otherCommit = caseState(rev.kase, sha).state;
  setSpec(rev.d, { status: 'rejected', caseHash: '0000000000000000' });
  const deferredStale = caseState(rev.kase, sha).state;
  check('readiness: carried over without its selfChecks, or reviewed at another commit -> migrate; carried over with them -> ready; deferred by the owner stays deferred after its case changes',
    noSelfChecks === 'migrate' && withSelfChecks === 'ready' && otherCommit === 'migrate' && deferredStale === 'deferred', JSON.stringify({ noSelfChecks, withSelfChecks, otherCommit, deferredStale }));

  // A spec waiting for review that fails one migration and passes the next is
  // waiting for review again: never reviewed without a review.
  const nav = fresh('navigator-3');
  setSpec(nav.d, { status: 'gated', caseHash: '0000000000000000' });
  const f1 = migrate('navigator-3');
  const n1 = specOf(nav.d);
  setSpec(nav.d, { caseHash: nav.kase.hash });
  const regen = caseState(nav.kase, sha).state;
  const f2 = migrate('navigator-3');
  const n2 = specOf(nav.d);
  check('migrate: a gated spec that fails a migration becomes a draft to regenerate; passing a later migration makes it gated again, not reviewed',
    f1.status === 0 && n1.status === 'draft' && n1.needsRegeneration?.fromStatus === 'gated' && regen === 'regenerate'
    && f2.status === 0 && n2.status === 'gated' && !n2.needsRegeneration && caseState(nav.kase, sha).state === 'review',
  `${f1.stdout.slice(-200)} | ${f2.stdout.slice(-200)}${f2.stderr.slice(-200)} | ${JSON.stringify({ s1: n1.status, r: n1.needsRegeneration, regen, s2: n2.status })}`);

  // The owner's decision on a spec a migration set aside settles it.
  setSpec(nav.d, { status: 'draft', needsRegeneration: { reason: 'selftest', fromStatus: 'gated' } });
  const dz = node([path.join(H, 'decide.mjs'), 'navigator-3', 'run', '--note', 'selftest']);
  check('decide: the owner\'s "run" on a spec a migration set aside clears its regeneration mark',
    dz.status === 0 && !specOf(nav.d).needsRegeneration && caseState(nav.kase, sha).state !== 'regenerate', `${dz.stdout.slice(-200)}${dz.stderr.slice(-200)} ${caseState(nav.kase, sha).state}`);
}

console.log(JSON.stringify({ checks }));
