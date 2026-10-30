#!/usr/bin/env node
// Aggregate a run's verdicts into summary.json and summary.md, by role and by
// case. Recomputes every number from per-assertion verdicts (never from an
// aggregate field) and keeps infrastructure ERRORs out of pass rates.
//
//   node summarize.mjs <run-dir>
//   node summarize.mjs --out <dir> <run-dir> <run-dir> ...   (cumulative, e.g. one run per role)
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const outAt = argv.indexOf('--out');
const outDir = outAt >= 0 ? argv[outAt + 1] : null;
const runDirs = argv.filter((_, i) => outAt < 0 || (i !== outAt && i !== outAt + 1));
if (!runDirs.length) throw new Error('usage: summarize.mjs [--out <dir>] <run-dir> [<run-dir> ...]');
// Output goes to the single run directory, or to --out for a cumulative view.
const runDir = outDir ?? runDirs[0];
mkdirSync(runDir, { recursive: true });

// Wilson 95% interval for a pass rate; honest at small n and near 0% or 100%.
function wilson(pass, n) {
  if (!n) return [null, null];
  const z = 1.96;
  const p = pass / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}
const pct = (x) => (x === null ? '—' : `${(100 * x).toFixed(0)}%`);

const rows = [];
const seeding = []; // history cases: did the forked session hold the seeded turns
const redactions = []; // runs whose output held the API key (redacted; rotate the key)
let retries = 0;
const attemptCost = {};
const attemptUnknown = {};
for (const oneRun of runDirs) {
const casesDir = path.join(oneRun, 'cases');
if (!existsSync(casesDir)) continue;
// Case directories only: a dot-folder (for example .claude/, which a client
// can create in a shell's working directory) is not a case.
for (const key of readdirSync(casesDir).filter((k) => !k.startsWith('.'))) {
  for (const rep of readdirSync(path.join(casesDir, key)).filter((r) => /^r\d+(-attempt\d+)?$/.test(r))) {
    // A retried infrastructure error keeps its failed first attempt; count it,
    // but it is not a separate run.
    const rdf = path.join(casesDir, key, rep, 'redaction.json');
    if (existsSync(rdf)) redactions.push({ key, rep, ...JSON.parse(readFileSync(rdf, 'utf8')) });
    if (/-attempt\d+$/.test(rep)) {
      retries += 1;
      const u = path.join(casesDir, key, rep, 'usage.json');
      // Its spend is real, so it counts toward cost; a killed attempt's spend is
      // unknown and is counted as unknown, not as zero.
      const role = key.replace(/-\d+$/, '');
      const au = existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : { costUnknown: true };
      attemptCost[role] = (attemptCost[role] ?? 0) + (au.costUsd ?? 0);
      if (au.costUnknown || au.costUsd === null || au.costUsd === undefined) attemptUnknown[role] = (attemptUnknown[role] ?? 0) + 1;
      continue;
    }
    const dir = path.join(casesDir, key, rep);
    const read = (f) => (existsSync(path.join(dir, f)) ? JSON.parse(readFileSync(path.join(dir, f), 'utf8')) : null);
    const v = read('verdicts.json');
    const sd = read('seeding.json');
    if (sd) seeding.push({ key, rep, ...sd });
    const u = read('usage.json') ?? {};
    rows.push({ key, role: key.replace(/-\d+$/, ''), rep, verdicts: v, usage: u });
  }
}
}

const tally = () => ({ runs: 0, errors: 0, timeouts: 0, incomplete: 0, overBudget: 0, invErrors: 0, costUnknown: 0, casePass: 0, a: { PASS: 0, FAIL: 0, UNCLEAR: 0, NEEDS_JUDGE: 0, ERROR: 0, NA: 0 }, det: 0, judge: 0, invFail: 0, costUsd: 0, judgeUsd: 0, wallMs: 0 });
const byRole = {};
const byCase = [];
const answerKeyFlags = [];
for (const r of rows) {
  if (r.verdicts?.answerKeyAccess?.length) answerKeyFlags.push(`${r.key} ${r.rep}: ${r.verdicts.answerKeyAccess.join(', ')}`);
  const t = (byRole[r.role] ??= tally());
  t.runs += 1;
  t.costUsd += r.usage.costUsd ?? 0;
  if (r.usage.costUnknown) t.costUnknown += 1; // killed run: spend not reported
  if (/budget/i.test(r.usage.subtype ?? '')) t.overBudget += 1;
  t.wallMs += r.usage.wallMs ?? 0;
  // A run that hit the time limit (entry.sh's timeout exits 124) is its own
  // row, not an error and not a failure.
  if (!r.verdicts && r.usage.exitCode === 124) { t.timeouts += 1; byCase.push({ key: r.key, rep: r.rep, status: 'TIMEOUT' }); continue; }
  if (!r.verdicts || r.verdicts.status !== 'GRADED') { t.errors += 1; byCase.push({ key: r.key, rep: r.rep, status: 'ERROR' }); continue; }
  const as = r.verdicts.assertions;
  for (const a of as) {
    t.a[a.verdict] = (t.a[a.verdict] ?? 0) + 1;
    t.judgeUsd += a.judgeCostUsd ?? a.judge?.costUsd ?? 0;
    if (a.grader === 'deterministic') t.det += 1;
    else if (a.grader === 'judge') t.judge += 1; // NA has no grader
  }
  // A grader error on an invariant is not a role failure; count it apart.
  const inv = (r.verdicts.invariants ?? []).filter((x) => !x.pass && !x.error).length;
  t.invFail += inv;
  t.invErrors += (r.verdicts.invariants ?? []).filter((x) => x.error).length;
  // A grader error or a missing judge verdict leaves the case INCOMPLETE: it is
  // neither a pass nor a model failure.
  const incomplete = as.some((a) => a.verdict === 'ERROR' || a.verdict === 'NEEDS_JUDGE');
  // NA assertions (not observable in one run) don't affect case status.
  const allPass = !incomplete && as.every((a) => a.verdict === 'PASS' || a.verdict === 'NA');
  if (incomplete) t.incomplete += 1;
  if (allPass) t.casePass += 1;
  const scored = as.filter((a) => a.verdict !== 'NA');
  byCase.push({ key: r.key, rep: r.rep, status: incomplete ? 'INCOMPLETE' : allPass ? 'PASS' : 'FAIL', pass: scored.filter((a) => a.verdict === 'PASS').length, total: scored.length, na: as.length - scored.length, failed: scored.filter((a) => a.verdict !== 'PASS').map((a) => `${a.i}:${a.verdict}`), invariantsFailed: inv, costUsd: r.usage.costUsd, wallMs: r.usage.wallMs });
}

// Flakiness between repetitions: for each case with two or more GRADED
// repetitions, an assertion differs when its outcome (PASS versus not PASS)
// is not the same in all of them. Pairs with ERROR, NEEDS_JUDGE, or NA on any
// side are left out (not a model result), and so are ungraded repetitions.
// A case flips when its complete status (PASS or FAIL) differs.
const flakiness = { casesCompared: 0, assertionsCompared: 0, differ: [], caseFlips: [], byRole: {} };
{
  const graded = new Map();
  for (const r of rows) if (r.verdicts?.status === 'GRADED') (graded.get(r.key) ?? graded.set(r.key, []).get(r.key)).push(r);
  for (const [key, list] of [...graded].sort()) {
    if (list.length < 2) continue;
    const role = key.replace(/-\d+$/, '');
    const fr = (flakiness.byRole[role] ??= { cases: 0, compared: 0, differ: 0 });
    flakiness.casesCompared += 1; fr.cases += 1;
    list.sort((a, b) => a.rep.localeCompare(b.rep, 'en', { numeric: true }));
    const n = Math.max(...list.map((r) => r.verdicts.assertions.length));
    for (let i = 0; i < n; i += 1) {
      const vs = list.map((r) => r.verdicts.assertions.find((a) => a.i === i)?.verdict);
      if (!vs.every((v) => ['PASS', 'FAIL', 'UNCLEAR'].includes(v))) continue;
      flakiness.assertionsCompared += 1; fr.compared += 1;
      if (new Set(vs.map((v) => v === 'PASS')).size > 1) { flakiness.differ.push({ key, i, verdicts: list.map((r, k) => `${r.rep} ${vs[k]}`) }); fr.differ += 1; }
    }
    const st = list.map((r) => byCase.find((c) => c.key === key && c.rep === r.rep)?.status).filter((x) => x === 'PASS' || x === 'FAIL');
    if (st.length > 1 && new Set(st).size > 1) flakiness.caseFlips.push({ key, statuses: list.map((r) => `${r.rep} ${byCase.find((c) => c.key === key && c.rep === r.rep)?.status}`) });
  }
}

// What each run measured (run.json) and which models judged it (verdicts).
const config = runDirs.filter((d) => existsSync(path.join(d, 'run.json'))).map((d) => {
  const r = JSON.parse(readFileSync(path.join(d, 'run.json'), 'utf8'));
  return { run: path.basename(d), commit: r.commit ?? null, model: r.model ?? null, effort: r.effort ?? null, client: r.versions?.claude ?? null };
});
const judgeModels = [...new Set(rows.flatMap((r) => (r.verdicts?.assertions ?? []).map((a) => a.judge?.model).filter(Boolean)))].sort();
const summary = { runDirs, config, judgeModels, retries, answerKeyFlags, seeding, redactions, flakiness, roles: {}, cases: byCase };
const md = ['# Eval summary', '',
  ...config.map((c) => `- \`${c.run}\`: framework ${c.commit ? c.commit.slice(0, 7) : 'unknown'}, ${c.model ?? 'unknown model'} at ${c.effort ?? 'default'} effort, ${c.client ?? 'unknown client'}`),
  `- Judge: ${judgeModels.join(', ') || 'none yet'}`, '',
  `Runs: ${runDirs.map((d) => `\`${path.basename(d)}\``).join(', ')}; retried infrastructure errors: ${retries}`,
  answerKeyFlags.length ? `\n**Runs that touched an evals file (review before trusting their PASSes):** ${answerKeyFlags.join('; ')}` : 'No run touched an evals file.', '',
  '| Role | Runs | Errors | Timeouts | Over budget | Assertions PASS | 95% CI | UNCLEAR | Grader errors | Cases all-PASS (complete cases) | Judge-graded | Invariant failures | Invariant grader errors | Run cost (USD) | Judge cost (USD) | Mean min/run |',
  '| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'];
for (const [role, cost] of Object.entries(attemptCost)) if (byRole[role]) byRole[role].costUsd += cost;
for (const [role, n] of Object.entries(attemptUnknown)) if (byRole[role]) byRole[role].costUnknown += n;
for (const [role, t] of Object.entries(byRole).sort()) {
  const graded = t.a.PASS + t.a.FAIL + t.a.UNCLEAR; // NEEDS_JUDGE and ERROR are not graded yet
  const [lo, hi] = wilson(t.a.PASS, graded);
  summary.roles[role] = { ...t, graded, passRate: graded ? t.a.PASS / graded : null, ci95: [lo, hi] };
  md.push(`| ${role} | ${t.runs} | ${t.errors} | ${t.timeouts} | ${t.overBudget} | ${t.a.PASS}/${graded} (${pct(graded ? t.a.PASS / graded : null)}) | ${pct(lo)}–${pct(hi)} | ${t.a.UNCLEAR} | ${t.a.ERROR} | ${t.casePass}/${t.runs - t.errors - t.timeouts - t.incomplete} | ${t.judge} | ${t.invFail} | ${t.invErrors} | ${t.costUsd.toFixed(2)}${t.costUnknown ? ` (+${t.costUnknown} unknown)` : ''} | ${t.judgeUsd.toFixed(2)} | ${t.runs ? (t.wallMs / t.runs / 60000).toFixed(1) : '—'} |`);
}
if (flakiness.casesCompared) {
  md.push('', '## Agreement between repetitions', '',
    `${flakiness.casesCompared} cases with two or more graded repetitions; ${flakiness.differ.length} of ${flakiness.assertionsCompared} comparable assertions differ (${pct(flakiness.assertionsCompared ? flakiness.differ.length / flakiness.assertionsCompared : null)}); ${flakiness.caseFlips.length} cases change status. Grader errors, unjudged, and NA assertions are left out.`,
    '', '| Role | Cases | Assertions compared | Differ |', '| --- | ---: | ---: | ---: |');
  for (const [role, x] of Object.entries(flakiness.byRole).sort()) md.push(`| ${role} | ${x.cases} | ${x.compared} | ${x.differ} |`);
  if (flakiness.differ.length) md.push('', 'Differing assertions:', ...flakiness.differ.map((d) => `- ${d.key}.${d.i}: ${d.verdicts.join(', ')}`));
  if (flakiness.caseFlips.length) md.push('', 'Cases that change status:', ...flakiness.caseFlips.map((d) => `- ${d.key}: ${d.statuses.join(', ')}`));
}
if (redactions.length) {
  md.push('', '## API key found in run output', '', 'Redacted before grading and judging; rotate the key.', '', '| Case | Rep | Files redacted | In git history (tarball not kept) |', '| --- | --- | ---: | --- |');
  for (const x of redactions) md.push(`| ${x.key} | ${x.rep} | ${x.files.length} | ${x.keyInGitHistory ? 'yes' : 'no'} |`);
}
if (seeding.length) {
  md.push('', '## Seeded sessions', '', '| Case | Rep | Forked session held the seeded turns | Seeded file unchanged |', '| --- | --- | --- | --- |');
  for (const x of seeding) md.push(`| ${x.key} | ${x.rep} | ${x.ok ? 'yes' : `no (${x.reason ?? `${x.matched}/${x.of}`})`} | ${x.seededUnchanged ? 'yes' : 'no'} |`);
}
md.push('', '## Cases', '', '| Case | Rep | Status | Assertions passing (NA excluded) | NA | Not passing | Invariant failures |', '| --- | --- | --- | ---: | ---: | --- | ---: |');
for (const c of byCase.sort((a, b) => a.key.localeCompare(b.key, 'en', { numeric: true }))) {
  md.push(`| ${c.key} | ${c.rep} | ${c.status} | ${c.pass ?? '—'}/${c.total ?? '—'} | ${c.na ?? '—'} | ${(c.failed ?? []).join(', ')} | ${c.invariantsFailed ?? '—'} |`);
}
// Runs that never produced a case directory: refused drafts, fixture or gate
// failures before the run, and runs skipped by the suite budget.
{
  // Only runs with no case directory: deferred cases and cases without a
  // fixture (NOT_RUN), refused drafts, budget skips. Fixture and gate failures
  // have a case directory and already appear above as ERROR rows.
  const notRun = runDirs.flatMap((one) => {
    const f = path.join(one, 'results.json');
    if (!existsSync(f)) return [];
    return JSON.parse(readFileSync(f, 'utf8')).filter((r) => r.status === 'SKIPPED' || r.status === 'NOT_RUN'
      || (r.status === 'ERROR' && !existsSync(path.join(one, 'cases', String(r.key), `r${r.rep}`))));
  });
  summary.notRun = notRun;
  if (notRun.length) {
    md.push('', '## Not run', '', '| Case | Rep | Status | Reason |', '| --- | --- | --- | --- |');
    for (const r of notRun) md.push(`| ${r.key ?? '?'} | ${r.rep ?? '?'} | ${r.status} | ${String(r.error ?? '').replace(/\|/g, '\\|').slice(0, 200)} |`);
  }
}
writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify(summary, null, 2));
writeFileSync(path.join(runDir, 'summary.md'), `${md.join('\n')}\n`);
console.log(md.join('\n'));
