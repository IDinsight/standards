// What the reference evals run (evals/README.md, "Reference evals"): the
// cases in each version, how many times, the settings each part runs with,
// and what that is likely to cost. No model, no Docker.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { EVALS_ROOT } from '../lib/config.mjs';
import { BASE_COMMIT, TAG } from './build-b.mjs';

export const CASES_DIR = path.join(EVALS_ROOT, 'references', 'cases');
export const CATALOG_DIR = path.join(EVALS_ROOT, 'references', 'catalog');
export const FIXTURES_DIR = path.join(EVALS_ROOT, 'fixtures', 'references');
// The settings each harness script gets: the reference evals' cases, catalog,
// and fixtures, or the suite's (documenter-38). An empty value means the
// default. Both stay at release 0.15.0 whatever EVAL_COMMIT says, since every
// fixture here is written and reviewed at it.
export const REFERENCES_ENV = { EVAL_CASES_DIR: CASES_DIR, EVAL_CATALOG_DIR: CATALOG_DIR, EVAL_FIXTURES_DIR: FIXTURES_DIR, EVAL_COMMIT: BASE_COMMIT };
export const SUITE_ENV = { EVAL_CASES_DIR: '', EVAL_CATALOG_DIR: '', EVAL_FIXTURES_DIR: '', EVAL_COMMIT: BASE_COMMIT };
// The suite case that runs in both versions (its failures on 31 October read readme.md).
export const PROBE = 'documenter-38';
// Version A installs release 0.15.0; version B installs the local tag and runs
// on the fixtures reviewed at 0.15.0 (run.mjs --reviewed-at).
export const VERSIONS = { A: { commit: BASE_COMMIT, reviewedAt: BASE_COMMIT }, B: { commit: TAG, reviewedAt: BASE_COMMIT } };
export const REPS = 3;
export const CONCURRENCY = 3;
export const BUDGET_USD = 90;

// Tasks are numbered 901 to 910, and trigger cases from 911.
export const kindOf = (id) => (id >= 911 ? 'trigger' : id >= 901 ? 'task' : null);

// Every case in evals/references/cases/<role>.json, read as it is (no settings needed).
export function referenceCases(dir = CASES_DIR) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.json')).sort().flatMap((f) => {
    const role = f.slice(0, -'.json'.length);
    return JSON.parse(readFileSync(path.join(dir, f), 'utf8')).evals.map((c) => ({ key: `${role}-${c.id}`, role, id: c.id, assertions: c.assertions ?? [], kind: kindOf(c.id) }));
  });
}

// The parts of a run, in the order they start. --smoke: one version A run of
// each task, nothing else.
export function makePlan({ smoke = false, cases = referenceCases() } = {}) {
  const tasks = cases.filter((c) => c.kind === 'task').map((c) => c.key);
  const triggers = cases.filter((c) => c.kind === 'trigger').map((c) => c.key);
  const reps = smoke ? 1 : REPS;
  const parts = [
    { name: 'A', version: 'A', kind: 'tasks', cases: tasks, env: 'references' },
    ...(smoke ? [] : [
      { name: 'B', version: 'B', kind: 'tasks', cases: tasks, env: 'references' },
      { name: 'A-documenter-38', version: 'A', kind: 'probe', cases: [PROBE], env: 'suite' },
      { name: 'B-documenter-38', version: 'B', kind: 'probe', cases: [PROBE], env: 'suite' },
      { name: 'A-triggers', version: 'A', kind: 'triggers', cases: triggers, env: 'references' },
    ]),
  ].filter((p) => p.cases.length).map((p) => ({ ...p, reps }));
  const problems = cases.filter((c) => !c.kind).map((c) => `${c.key}: number reference cases from 901 (tasks) and 911 (trigger cases)`);
  if (!tasks.length) problems.push(`no tasks yet: write them in ${path.relative(path.dirname(EVALS_ROOT), CASES_DIR)}/<role>.json`);
  return { smoke, reps, tasks, triggers, parts, problems };
}

// The arguments run.mjs gets for one part.
export function runArgs(part, { runId, concurrency = CONCURRENCY, model, effort, budgetUsd = null, execute = false }) {
  const v = VERSIONS[part.version];
  return ['--cases', part.cases.join(','), '--reps', String(part.reps), '--concurrency', String(concurrency), '--run-id', `${runId}/${part.name}`,
    '--commit', v.commit, '--reviewed-at', v.reviewedAt, '--model', model, '--effort', effort,
    ...(budgetUsd === null ? [] : ['--suite-budget-usd', String(budgetUsd)]), ...(execute ? ['--execute'] : [])];
}

// Cost ranges (estimates, in USD) from the 31 October runs (Sonnet 5.5 at high
// effort) and the design's figures: one run of a task by role, the trigger
// cases, documenter-38, the judge per task run, and the judge checks as a
// share of the judge's cost.
const RUN_USD = { developer: [1.0, 2.0], tester: [1.1, 2.7], architect: [0.9, 1.6], documenter: [1.0, 1.85] };
const OTHER_ROLE_USD = [0.6, 2.7];
const PROBE_USD = [1.0, 1.5];
const TRIGGER_USD = [0.6, 1.2];
const JUDGE_USD = [0.15, 0.32];
const CHECKS_SHARE = 0.65;

export function estimate(plan) {
  const add = (a, b, n = 1) => [a[0] + b[0] * n, a[1] + b[1] * n];
  let runs = [0, 0];
  let judge = [0, 0];
  let count = 0;
  for (const p of plan.parts) {
    for (const key of p.cases) {
      const role = key.replace(/-\d+$/, '');
      const each = p.kind === 'tasks' ? RUN_USD[role] ?? OTHER_ROLE_USD : p.kind === 'probe' ? PROBE_USD : TRIGGER_USD;
      runs = add(runs, each, p.reps);
      if (p.kind === 'tasks') judge = add(judge, JUDGE_USD, p.reps);
      count += p.reps;
    }
  }
  const checks = plan.smoke ? [0, 0] : [judge[0] * CHECKS_SHARE, judge[1] * CHECKS_SHARE];
  return { count, runs, judge, checks, total: [runs[0] + judge[0] + checks[0], runs[1] + judge[1] + checks[1]] };
}
