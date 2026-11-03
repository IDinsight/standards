#!/usr/bin/env node
// The reference evals' side-by-side summary (evals/README.md, "Read the
// results"): references-summary.md and references-summary.json in the run's
// folder, recomputed from each run's own files every time.
//
//   node summary.mjs <run-folder>      (evals/runs/<id>, which holds references.json)
//
// A run's score is the mean of its task's outcome checks and outcome judge
// items: PASS 1, FAIL or UNCLEAR 0, a share check its value. A run with an
// ERROR among them has no score until it is graded again; so has a run that
// never finished (an infrastructure error, or one the budget skipped). A run
// that hit the time limit is scored on what it left. The gap is version A's
// mean score minus version B's, for each task, and over the tasks with an
// equal weight each; its 90% range comes from 10,000 resamples of the runs
// within each task and version, seeded by the run id. The rules fixed before
// the first run are applied only when every planned task run has a score;
// until then the gaps are shown as they stand.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { GRADERS_ROOT, loadGrader } from './graders.mjs';
import { PROBE } from './plan.mjs';

const readJson = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null);
const mean = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
const SCORED = new Set(['GRADED', 'OVER_BUDGET', 'TIMEOUT']);
const TIERS = ['outcome', 'reference', 'control'];
const READ = new Set(['full', 'partial']);

// A seeded random number generator (mulberry32), so the range is the same on
// every rerun of the summary.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const quantile = (sorted, q) => {
  const pos = q * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
};

// The gap over tasks, each [aScores, bScores] with at least one score on
// each side, and its 90% range: resample each side of each task with
// replacement, recompute the mean of the task gaps, take the 5th and 95th
// percentiles.
export function bootstrapGap(tasks, { iterations = 10000, seed = 1 } = {}) {
  const use = tasks.filter(([a, b]) => a.length && b.length);
  if (!use.length) return { gap: null, low: null, high: null, tasks: 0 };
  const gap = mean(use.map(([a, b]) => mean(a) - mean(b)));
  const next = rng(seed);
  const pick = (xs) => { let s = 0; for (let i = 0; i < xs.length; i += 1) s += xs[Math.floor(next() * xs.length)]; return s / xs.length; };
  const sims = new Float64Array(iterations);
  for (let n = 0; n < iterations; n += 1) {
    let total = 0;
    for (const [a, b] of use) total += pick(a) - pick(b);
    sims[n] = total / use.length;
  }
  sims.sort();
  return { gap, low: quantile(sims, 0.05), high: quantile(sims, 0.95), tasks: use.length };
}

// The value a check or judge item adds to a score, or null (not graded).
const valueOf = (c) => (c.value !== undefined && c.verdict !== 'ERROR' ? c.value : c.verdict === 'PASS' ? 1 : ['FAIL', 'UNCLEAR'].includes(c.verdict) ? 0 : null);
function tierScore(entries, tier) {
  const xs = entries.filter((e) => e.tier === tier);
  if (!xs.length) return { score: null, none: true };
  const v = xs.map(valueOf);
  if (v.includes(null)) return { score: null, incomplete: xs.filter((e, i) => v[i] === null).map((e) => e.id) };
  return { score: mean(v) };
}

// Every repetition the plan expects, with what each one left.
export function collectRuns(root, plan) {
  const runs = [];
  for (const part of plan.parts) {
    const dir = path.join(root, part.name);
    const results = readJson(path.join(dir, 'results.json')) ?? [];
    for (const key of part.cases) {
      for (let rep = 1; rep <= part.reps; rep += 1) {
        const d = path.join(dir, 'cases', key, `r${rep}`);
        const r = results.find((x) => x.key === key && x.rep === rep) ?? null;
        const attempts = [];
        for (let n = 1; existsSync(`${d}-attempt${n}`); n += 1) attempts.push(readJson(path.join(`${d}-attempt${n}`, 'usage.json')) ?? { costUnknown: true });
        runs.push({
          part: part.name, version: part.version, kind: part.kind, key, rep, dir,
          status: r?.status ?? 'NOT_RUN', error: r?.error ?? (r ? null : 'not run yet'),
          usage: readJson(path.join(d, 'usage.json')), attempts,
          post: readJson(path.join(d, 'post-checks.json')), blind: readJson(path.join(d, 'blind-verdicts.json')),
          reads: readJson(path.join(d, 'reads.json')), verdicts: readJson(path.join(d, 'verdicts.json')),
          redaction: readJson(path.join(d, 'redaction.json')), unsafeGit: existsSync(path.join(d, 'unsafe-git.json')),
          started: existsSync(path.join(d, 'transcript.jsonl')),
        });
      }
    }
  }
  return runs;
}

// Scores and pass counts for one task's runs.
function taskView(key, runs, grader) {
  const judged = new Set((grader.judge?.items ?? []).map((c) => c.id));
  const order = [...(grader.checks ?? []), ...(grader.judge?.items ?? [])]
    .map((c) => ({ id: c.id, tier: c.tier, text: c.text, kind: judged.has(c.id) ? 'judge' : c.kind === 'share' ? 'share' : 'code' }));
  const rows = runs.map((r) => {
    const entries = [...(r.post?.checks ?? []), ...Object.entries(r.blind?.items ?? {}).map(([id, v]) => ({ id, ...v }))];
    const byId = new Map(entries.map((e) => [e.id, e]));
    // Every listed check and item counts, so a missing one is an error, not a pass.
    const listed = order.map((c) => byId.get(c.id) ?? { id: c.id, tier: c.tier, verdict: 'MISSING' });
    const scored = SCORED.has(r.status);
    const tiers = Object.fromEntries(TIERS.map((t) => [t, scored ? tierScore(listed, t) : { score: null }]));
    const ref = grader.reference ? r.reads?.references?.[grader.reference] : null;
    return { ...r, scored, listed, tiers, read: ref?.status ?? (r.reads ? 'not-seen' : null),
      rulesSeen: r.reads?.rules ? `${r.reads.rules.filter((x) => x.exposed).length}/${r.reads.rules.length}` : null,
      searches: r.reads?.searches?.length ?? 0 };
  });
  const side = (v) => rows.filter((r) => r.version === v);
  const scores = (v, tier) => side(v).map((r) => r.tiers[tier].score).filter((s) => s !== null);
  const checks = order.map((c) => {
    const count = (v) => {
      const got = side(v).filter((r) => r.scored).map((r) => r.listed.find((e) => e.id === c.id)).filter((e) => valueOf(e) !== null);
      return { n: got.length, pass: got.filter((e) => e.verdict === 'PASS').length, sum: got.reduce((s, e) => s + valueOf(e), 0), share: c.kind === 'share' };
    };
    return { ...c, A: count('A'), B: count('B') };
  });
  return { key, label: grader.label ?? key, reference: grader.reference ?? null, rows, checks, scores: { A: Object.fromEntries(TIERS.map((t) => [t, scores('A', t)])), B: Object.fromEntries(TIERS.map((t) => [t, scores('B', t)])) } };
}

// The rules fixed before the first real run (evals/README.md, "Read the results").
export function nextSteps({ outcome, reference, tasks }) {
  // Reads in version A's finished runs; a task with none is counted in neither direction.
  const readTasks = tasks.map((t) => {
    const a = t.rows.filter((r) => r.version === 'A' && r.scored);
    return { key: t.key, runs: a.length, read: a.filter((r) => READ.has(r.read)).length };
  }).filter((t) => t.runs);
  const few = readTasks.filter((t) => t.read / t.runs < 2 / 3);
  const enoughReads = readTasks.length - few.length;
  const fewReads = few.length;
  const need = Math.ceil(0.8 * tasks.length);
  const readOk = tasks.length > 0 && enoughReads >= need;
  const worse = tasks.flatMap((t) => t.checks.filter((c) => c.tier === 'outcome' && c.B.sum - c.A.sum >= 2).map((c) => `${t.label} ${c.id} (A ${c.A.share ? c.A.sum.toFixed(2) : c.A.pass} of ${c.A.n}, B ${c.B.share ? c.B.sum.toFixed(2) : c.B.pass} of ${c.B.n})`));
  const has = (g) => g.gap !== null;
  const r = (applies, step, why) => ({ applies, step, why });
  return [
    r(has(outcome) && outcome.gap >= 0.15 && outcome.low > 0 && readOk, 'Run a larger study: more references and tasks, 5 or more runs per version, and a second model',
      `overall gap ${fmt(outcome.gap)}, 90% range ${range(outcome)}; version A read the reference in at least 2 of 3 runs on ${enoughReads} of ${tasks.length} tasks (needs ${need})`),
    r(fewReads >= 3, 'First fix how the role finds those references: the "Read when" line at the top of each one, or the lines that point to it',
      `version A read the reference in fewer than 2 of 3 runs on ${fewReads} tasks${fewReads ? `: ${few.map((t) => `${t.key} (${t.read} of ${t.runs})`).join(', ')}` : ''}`),
    r(readOk && has(outcome) && outcome.low >= -0.1 && outcome.high <= 0.1, 'No larger study for these references. Consider making them shorter, because reading them costs tokens',
      `reads as in the first rule: ${readOk ? 'yes' : 'no'}; 90% range ${range(outcome)}`),
    r(worse.length > 0, 'Look for a misleading example in that reference before any more runs', worse.length ? `version A worse by 2 or more runs: ${worse.join('; ')}` : 'no outcome check where version A is worse by 2 or more runs'),
    r(has(reference) && reference.low > 0 && has(outcome) && outcome.low <= 0, 'The references change the work but not its quality here. A larger study needs harder tasks',
      `reference checks: gap ${fmt(reference.gap)}, 90% range ${range(reference)} (more: range above 0); outcome 90% range ${range(outcome)} (no better: it reaches 0 or below)`),
  ];
}

const fmt = (x) => (x === null || x === undefined ? '—' : `${x >= 0 ? '+' : ''}${x.toFixed(2)}`);
const range = (g) => (g.low === null ? '—' : `${fmt(g.low)} to ${fmt(g.high)}`);
const num = (x) => (x === null || x === undefined ? '—' : x.toFixed(2));
const usd = (x) => `$${(x ?? 0).toFixed(2)}`;
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function summarizeReferences(root, { gradersRoot = GRADERS_ROOT } = {}) {
  const plan = readJson(path.join(root, 'references.json'));
  if (!plan) throw new Error(`${root} has no references.json: is it a reference evals run?`);
  const seed = Number.parseInt(createHash('sha256').update(plan.runId).digest('hex').slice(0, 8), 16);
  const runs = collectRuns(root, plan);
  const graders = new Map();
  const grader = (key) => { if (!graders.has(key)) graders.set(key, loadGrader(path.join(gradersRoot, key))); return graders.get(key); };
  const taskKeys = [...new Set(runs.filter((r) => r.kind === 'tasks').map((r) => r.key))];
  const tasks = taskKeys.map((k) => taskView(k, runs.filter((r) => r.kind === 'tasks' && r.key === k), grader(k).manifest ?? {}));
  const pooled = Object.fromEntries(TIERS.map((t) => [t, bootstrapGap(tasks.map((x) => [x.scores.A[t], x.scores.B[t]]), { seed })]));
  const perTask = tasks.map((x) => ({ key: x.key, ...bootstrapGap([[x.scores.A.outcome, x.scores.B.outcome]], { seed }) }));
  const unscored = tasks.flatMap((t) => t.rows).filter((r) => r.tiers.outcome.score === null).length;
  const final = !plan.smoke && tasks.length > 0 && unscored === 0;
  const steps = final ? nextSteps({ outcome: pooled.outcome, reference: pooled.reference, tasks }) : [];

  // Trigger cases: a run passes when it reads none of the references to avoid
  // and every one it should read.
  const triggers = [...new Set(runs.filter((r) => r.kind === 'triggers').map((r) => r.key))].map((key) => {
    const t = grader(key).manifest?.trigger ?? {};
    const rows = runs.filter((r) => r.kind === 'triggers' && r.key === key && r.reads).map((r) => {
      const status = (ref) => r.reads.references?.[ref]?.status ?? 'not-seen';
      const readAvoided = (t.avoid ?? []).filter((ref) => READ.has(status(ref)));
      const missed = (t.read ?? []).filter((ref) => !READ.has(status(ref)));
      return { rep: r.rep, readAvoided, missed, pass: !readAvoided.length && !missed.length };
    });
    return { key, avoid: t.avoid ?? [], read: t.read ?? [], rows };
  });
  const references = [...new Set([...tasks.map((t) => t.reference), ...triggers.flatMap((t) => [...t.avoid, ...t.read])].filter(Boolean))].sort().map((ref) => {
    const applied = runs.filter((r) => r.kind === 'tasks' && r.version === 'A' && r.reads && grader(r.key).manifest?.reference === ref);
    const notApplied = runs.filter((r) => r.kind === 'triggers' && r.reads && (grader(r.key).manifest?.trigger?.avoid ?? []).includes(ref));
    const n = (list) => `${list.filter((r) => READ.has(r.reads.references?.[ref]?.status)).length} of ${list.length}`;
    return { ref, applied: applied.length ? n(applied) : '—', notApplied: notApplied.length ? n(notApplied) : '—' };
  });

  // documenter-38: every assertion PASS (NA aside) is a pass.
  const probeRef = 'skills/documenter/references/readme.md';
  const probe = runs.filter((r) => r.kind === 'probe').map((r) => {
    const a = (r.verdicts?.assertions ?? []).filter((x) => x.verdict !== 'NA');
    const complete = a.length > 0 && a.every((x) => ['PASS', 'FAIL', 'UNCLEAR'].includes(x.verdict));
    return { version: r.version, rep: r.rep, status: r.status, verdicts: (r.verdicts?.assertions ?? []).map((x) => x.verdict), pass: complete ? a.every((x) => x.verdict === 'PASS') : null, read: r.reads?.references?.[probeRef]?.status ?? null };
  });

  // Cost and time of each version: every attempt's cost counts.
  const versions = [...new Set(plan.parts.map((p) => p.version))].sort();
  const cost = versions.map((v) => {
    const mine = runs.filter((r) => r.version === v);
    // A run that started but never wrote its usage (stopped by Ctrl+C) has an unknown cost.
    const usages = mine.flatMap((r) => [r.usage ?? (r.started ? { costUnknown: true } : null), ...r.attempts]).filter(Boolean);
    const finished = mine.filter((r) => r.usage);
    const judge = mine.reduce((s, r) => s + Object.values(r.blind?.items ?? {}).reduce((t, x) => t + (x.costUsd ?? 0), 0)
      + (r.verdicts?.assertions ?? []).reduce((t, x) => t + (x.judgeCostUsd ?? 0), 0), 0);
    return { version: v, runs: finished.length, runUsd: usages.reduce((s, u) => s + (u.costUsd ?? 0), 0), unknown: usages.filter((u) => u.costUnknown || u.costUsd === null || u.costUsd === undefined).length,
      minutes: mean(finished.map((r) => (r.usage.wallMs ?? 0) / 60000)), turns: mean(finished.map((r) => r.usage.turns).filter((x) => typeof x === 'number')), judgeUsd: judge };
  });

  // Workflow checks (the cases' exact assertions and invariants): reported, not scored.
  const workflow = plan.parts.map((p) => {
    const mine = runs.filter((r) => r.part === p.name && r.verdicts);
    const det = mine.flatMap((r) => r.verdicts.assertions.filter((a) => a.grader === 'deterministic'));
    const inv = mine.flatMap((r) => r.verdicts.invariants ?? []);
    return { part: p.name, runs: mine.length, pass: det.filter((a) => a.verdict === 'PASS').length, of: det.filter((a) => a.verdict !== 'NA').length, invFail: inv.filter((x) => !x.pass && !x.error).length, invError: inv.filter((x) => x.error).length };
  });

  const problems = [];
  for (const r of runs) {
    const where = `${r.part} ${r.key} r${r.rep}`;
    if (!SCORED.has(r.status) && r.status !== 'DRY_RUN') problems.push(`${where}: ${r.status}${r.error ? ` (${r.error})` : ''}`);
    if (r.kind === 'tasks' && SCORED.has(r.status)) {
      if (!r.post) problems.push(`${where}: not graded yet (no post-checks.json)`);
      for (const p of r.post?.problems ?? []) problems.push(`${where}: grader: ${p}`);
      for (const [id, v] of Object.entries(r.blind?.items ?? {})) {
        if (v.blocked) problems.push(`${where}: judge item ${id} blocked: the request names ${v.blocked.join(', ')}`);
        else if (v.verdict === 'ERROR') problems.push(`${where}: judge item ${id}: ERROR (${v.rationale})`);
        else if (v.verdict === 'UNCLEAR') problems.push(`${where}: judge item ${id}: UNCLEAR, counted as not passed (${v.rationale})`);
      }
    }
    if (r.version === 'B' && r.reads?.searches?.length) problems.push(`${where}: ${r.reads.searches.length} calls looked for a references/ path`);
    if (r.verdicts?.answerKeyAccess?.length) problems.push(`${where}: answer-key access: ${r.verdicts.answerKeyAccess.join(', ')}`);
    if (r.redaction) problems.push(`${where}: the API key appeared in the run's output and was redacted: rotate the key`);
    if (r.unsafeGit) problems.push(`${where}: the run left unsafe git config; its project is kept for you to look at`);
  }
  for (const t of tasks) {
    for (const row of t.rows) {
      const inc = TIERS.flatMap((tier) => row.tiers[tier].incomplete ?? []);
      if (row.scored && inc.length) problems.push(`${row.part} ${t.key} r${row.rep}: no score yet: ${[...new Set(inc)].join(', ')} not graded`);
    }
  }
  const checksFile = readJson(path.join(root, 'judge-checks.json'));
  const judgeChecksMd = existsSync(path.join(root, 'judge-checks.md')) ? readFileSync(path.join(root, 'judge-checks.md'), 'utf8').trim() : null;

  // The report.
  const md = [`# Reference evals: ${plan.runId}${plan.smoke ? ' (smoke test)' : ''}`, ''];
  md.push(`Version A installs release 0.15.0 (\`${plan.versions.A.commit.slice(0, 7)}\`), with the 25 references.${plan.smoke ? '' : ` Version B installs \`${plan.versions.B.commit.slice(0, 7)}\`, the same release without them.`} Model under test: ${plan.model} (${plan.effort}).`, '');
  if (plan.smoke) md.push('A smoke test runs version A only, once per task, so it has no gaps. Its runs never count toward the result.', '');
  else {
    md.push('## Result', '', '| Checks | Gap (A − B) | 90% range | Tasks |', '| --- | --- | --- | --- |');
    for (const t of TIERS) md.push(`| ${t} | ${fmt(pooled[t].gap)} | ${range(pooled[t])} | ${pooled[t].tasks} |`);
    if (final) {
      md.push('', 'Next step, by the rules fixed before the first run:', '');
      for (const s of steps) md.push(`- ${s.applies ? '**Applies**' : 'Does not apply'}: ${s.step}. (${s.why})`);
      if (!steps.some((s) => s.applies)) md.push('', 'No rule applies.');
    } else {
      md.push('', `Not final: ${unscored} of ${tasks.flatMap((t) => t.rows).length} task runs have no score yet (see Problems), so the gaps above are as they stand and the rules fixed before the first run are not applied. Rerun with --run-id to finish them.`);
    }
    md.push('');
  }
  md.push('## Tasks', '');
  for (const t of tasks) {
    const pt = perTask.find((x) => x.key === t.key);
    md.push(`### ${t.label}: ${t.key}${t.reference ? ` (\`${path.basename(t.reference)}\`)` : ''}`, '');
    md.push('| Version | Run | Status | Score | Reference | Control | Reference read | Rules seen | Cost | Minutes |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const row of t.rows) {
      const s = (tier) => (row.tiers[tier].none ? 'n/a' : num(row.tiers[tier].score));
      md.push(`| ${row.version} | r${row.rep} | ${row.status} | ${s('outcome')} | ${s('reference')} | ${s('control')} | ${row.read ?? '—'}${row.version === 'B' && row.searches ? ` (${row.searches} searches)` : ''} | ${row.rulesSeen ?? '—'} | ${row.usage ? usd(row.usage.costUsd) : '—'} | ${row.usage ? num((row.usage.wallMs ?? 0) / 60000) : '—'} |`);
    }
    md.push('');
    if (!plan.smoke) md.push(`Gap ${fmt(pt.gap)} (90% range ${range(pt)}): version A ${num(mean(t.scores.A.outcome))} over ${t.scores.A.outcome.length} runs, version B ${num(mean(t.scores.B.outcome))} over ${t.scores.B.outcome.length}.`, '');
    md.push(`| Check | Tier | By | ${plan.smoke ? 'A' : 'A | B'} |`, `| --- | --- | --- | ${plan.smoke ? '---' : '--- | ---'} |`);
    const shown = (c, x) => (c.kind === 'share' ? `mean ${x.n ? num(x.sum / x.n) : '—'} (${x.n} runs)` : `${x.pass} of ${x.n}`);
    for (const c of t.checks) md.push(`| ${cell(c.id)}: ${cell(c.text)} | ${c.tier} | ${c.kind === 'judge' ? 'judge' : 'code'} | ${shown(c, c.A)}${plan.smoke ? '' : ` | ${shown(c, c.B)}`} |`);
    md.push('');
  }
  if (triggers.length) {
    md.push('## Trigger cases', '', 'A run passes when it reads (all or part of) none of the references it should leave alone, and each one it should read.', '',
      '| Case | Should not read | Should read | Passed | Runs that read one to avoid |', '| --- | --- | --- | --- | --- |');
    for (const t of triggers) md.push(`| ${t.key} | ${t.avoid.map((x) => path.basename(x)).join(', ') || '—'} | ${t.read.map((x) => path.basename(x)).join(', ') || '—'} | ${t.rows.filter((x) => x.pass).length} of ${t.rows.length} | ${t.rows.filter((x) => x.readAvoided.length).map((x) => `r${x.rep}: ${x.readAvoided.map((y) => path.basename(y)).join(', ')}`).join('; ') || '—'} |`);
    md.push('', '| Reference | Read when it applied (version A task runs) | Read when it did not (trigger runs) |', '| --- | --- | --- |');
    for (const x of references) md.push(`| ${path.basename(x.ref)} | ${x.applied} | ${x.notApplied} |`);
    md.push('');
  }
  if (probe.length) {
    md.push(`## ${PROBE}`, '', 'Reported apart from the tasks. If version B passes where version A fails, the reference helped cause the failure.', '',
      '| Version | Run | Status | Assertions | All pass | readme.md |', '| --- | --- | --- | --- | --- | --- |');
    for (const p of probe) md.push(`| ${p.version} | r${p.rep} | ${p.status} | ${p.verdicts.join(', ') || '—'} | ${p.pass === null ? 'incomplete' : p.pass ? 'yes' : 'no'} | ${p.read ?? '—'} |`);
    for (const v of versions) {
      const mine = probe.filter((p) => p.version === v && p.pass !== null);
      md.push('', `Version ${v}: ${mine.filter((p) => p.pass).length} of ${mine.length} complete runs pass.`);
    }
    md.push('');
  }
  md.push('## Cost and time', '', '| Version | Runs | Run cost | Mean per run | Mean minutes | Mean turns | Judge cost |', '| --- | --- | --- | --- | --- | --- | --- |');
  for (const c of cost) md.push(`| ${c.version} | ${c.runs} | ${usd(c.runUsd)}${c.unknown ? ` (+${c.unknown} unknown)` : ''} | ${c.runs ? usd(c.runUsd / c.runs) : '—'} | ${num(c.minutes)} | ${c.turns === null ? '—' : c.turns.toFixed(0)} | ${usd(c.judgeUsd)} |`);
  if (checksFile) md.push('', `Judge checks: ${usd(checksFile.costUsd)}.`);
  md.push('', '## Workflow checks (reported, not scored)', '', '| Part | Runs | Assertions passed | Invariant failures | Invariant grader errors |', '| --- | --- | --- | --- | --- |');
  for (const w of workflow) md.push(`| ${w.part} | ${w.runs} | ${w.pass} of ${w.of} | ${w.invFail} | ${w.invError} |`);
  if (judgeChecksMd) md.push('', '## Judge checks', '', judgeChecksMd);
  md.push('', '## Problems', '', ...(problems.length ? problems.map((p) => `- ${p}`) : ['None.']));
  md.push('', '## Limits', '',
    '- With 3 runs per version, only large differences show. A difference of one run in a task is within normal run-to-run noise.',
    '- The tasks are chosen so that the references matter. The result is about these tasks, not about every reference or every use of one.',
    '- It tests one model in one client (Claude Code).',
    '- The work itself can show which version made it, for example code copied from a reference. The judge cannot be blinded to that.');
  writeFileSync(path.join(root, 'references-summary.md'), `${md.join('\n')}\n`);
  const json = { runId: plan.runId, smoke: plan.smoke, final, unscored, pooled, perTask, nextSteps: steps, tasks: tasks.map((t) => ({ key: t.key, label: t.label, reference: t.reference, scores: t.scores, checks: t.checks, runs: t.rows.map((r) => ({ version: r.version, rep: r.rep, status: r.status, tiers: r.tiers, read: r.read, rulesSeen: r.rulesSeen, searches: r.searches })) })),
    triggers, references, probe, cost, workflow, problems, judgeChecks: checksFile };
  writeFileSync(path.join(root, 'references-summary.json'), JSON.stringify(json, null, 2));
  return json;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.argv[2];
  if (!root) throw new Error('usage: summary.mjs <run-folder>');
  summarizeReferences(root);
  console.log(`Summary: ${path.join(root, 'references-summary.md')}`);
}
