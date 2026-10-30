// Settings for the eval harness, in one place. Every value comes from the
// process environment, then the repository's root `.env`, then the default
// below, so a one-off `EVAL_CONCURRENCY=2 pnpm eval ...` overrides `.env`.
//
// The API key is the one secret. It is read here but never copied into
// process.env: readApiKey() hands it to the two places that need it (the SDK
// client for the judge, generator, and reviewer, and the environment of each
// `docker run`), so tools the harness spawns (git, pnpm, the installer) never
// see it. Nothing in the harness prints it.
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

// evals/harness/lib -> evals/harness -> evals -> repo root
export const HARNESS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const EVALS_ROOT = path.dirname(HARNESS_DIR);
export const REPO_ROOT = path.dirname(EVALS_ROOT);
export const ENV_FILE = process.env.EVAL_ENV_FILE ?? path.join(REPO_ROOT, '.env');

// The root .env, parsed once. A missing file is not an error: every setting
// has a default except the key, which readApiKey() reports.
const dotenv = existsSync(ENV_FILE) ? parseEnv(readFileSync(ENV_FILE, 'utf8')) : {};
// EVAL_* settings from .env become defaults in process.env, so child
// processes (the harness's own scripts, run by cli.mjs) see the same values.
// Not the switch that allows model calls (only `--execute` sets it) or the
// test-only fakes.
const fromEnvFile = (k) => k.startsWith('EVAL_') && !['EVAL_ALLOW_MODEL', 'EVAL_GIT_HERMETIC'].includes(k) && !k.startsWith('EVAL_FAKE_');
for (const [k, v] of Object.entries(dotenv)) {
  if (fromEnvFile(k) && process.env[k] === undefined) process.env[k] = v;
}
const setting = (name, fallback) => (process.env[name] === undefined || process.env[name] === '' ? fallback : process.env[name]);

// Git as the harness runs it, the same on every machine. Fixture builds and
// their fixtureHash, the framework export, and every inspection of a run's
// repository ignore the user's global and system git config (core.autocrlf, a
// global ignore or attributes file, global hooks), never start a repository's
// fsmonitor, and never let `git status` write the index. Set in process.env,
// so every git the harness spawns, directly or through check.mjs, gets it.
const HARNESS_GIT = { 'core.autocrlf': 'false', 'core.excludesFile': '/dev/null', 'core.attributesFile': '/dev/null', 'core.fsmonitor': 'false' };
if (!process.env.EVAL_GIT_HERMETIC) {
  process.env.EVAL_GIT_HERMETIC = '1';
  process.env.GIT_CONFIG_GLOBAL = '/dev/null';
  process.env.GIT_CONFIG_NOSYSTEM = '1';
  process.env.GIT_OPTIONAL_LOCKS = '0';
  let n = Number(process.env.GIT_CONFIG_COUNT ?? 0);
  for (const [k, v] of Object.entries(HARNESS_GIT)) {
    process.env[`GIT_CONFIG_KEY_${n}`] = k;
    process.env[`GIT_CONFIG_VALUE_${n}`] = v;
    n += 1;
  }
  process.env.GIT_CONFIG_COUNT = String(n);
}
// The user's own git environment, for questions about what their `git add`
// would do (the committed-fixtures check).
export function userGitEnv() {
  const env = { ...process.env };
  for (const k of ['EVAL_GIT_HERMETIC', 'GIT_CONFIG_GLOBAL', 'GIT_CONFIG_NOSYSTEM', 'GIT_OPTIONAL_LOCKS', 'GIT_CONFIG_COUNT']) delete env[k];
  for (const k of Object.keys(env)) if (/^GIT_CONFIG_(KEY|VALUE)_\d+$/.test(k)) delete env[k];
  return env;
}

// The framework release under test: installed into every fixture and recorded
// in each run's run.json. A tag, branch, or commit that `git rev-parse` knows.
export const DEFAULT_COMMIT = setting('EVAL_COMMIT', 'v0.15.0');

// Model under test, run through Claude Code (`claude -p --model --effort`).
export const MODEL = setting('EVAL_MODEL', 'claude-sonnet-5-5');
export const EFFORT = setting('EVAL_EFFORT', 'high');

// The judge grades the assertions exact checks cannot decide. Opus 5.5
// defaults to medium effort, so the effort is always sent explicitly.
export const JUDGE_MODEL = setting('EVAL_JUDGE_MODEL', 'claude-opus-5-5');
export const JUDGE_EFFORT = setting('EVAL_JUDGE_EFFORT', 'high');
// The second judge re-grades a sample of verdicts (judge-checks.mjs). It must
// be a different model from the judge to say anything about the judge.
// "none" skips that check.
export const SECOND_JUDGE_MODEL = setting('EVAL_SECOND_JUDGE_MODEL', 'claude-fable-5-1');
export const SECOND_JUDGE_EFFORT = setting('EVAL_SECOND_JUDGE_EFFORT', 'medium');

// Fixture generation and the gate-3 fixture review.
export const GEN_MODEL = setting('EVAL_GEN_MODEL', 'claude-opus-5-5');
export const REVIEW_MODEL = setting('EVAL_REVIEW_MODEL', 'claude-opus-5-5');
export const FIXTURE_EFFORT = setting('EVAL_FIXTURE_EFFORT', 'high');

// The runner image pins the Claude Code version, so runs are comparable. The
// tag names the version, so changing it builds and uses a separate image.
export const CLAUDE_CODE_VERSION = setting('EVAL_CLAUDE_CODE_VERSION', '2.1.283');
export const PNPM_VERSION = setting('EVAL_PNPM_VERSION', '10.34.5');
export const PLAYWRIGHT_VERSION = setting('EVAL_PLAYWRIGHT_VERSION', '1.63.0');
export const IMAGE = setting('EVAL_IMAGE', `standards-eval:claude-${CLAUDE_CODE_VERSION}`);
export const BROWSER_IMAGE = setting('EVAL_BROWSER_IMAGE', `standards-eval:claude-${CLAUDE_CODE_VERSION}-browser`);

// Where data lives. All of it is gitignored (evals/.gitignore).
// Relative paths in settings are relative to the repository root.
export const FIXTURES_ROOT = path.resolve(REPO_ROOT, setting('EVAL_FIXTURES_DIR', path.join(EVALS_ROOT, 'fixtures')));
export const RUNS_ROOT = path.join(EVALS_ROOT, 'runs');

// Where the key comes from, without revealing it: "environment", ".env", or null.
export function apiKeySource() {
  if (process.env.ANTHROPIC_API_KEY) return 'environment';
  if (dotenv.ANTHROPIC_API_KEY) return '.env';
  return null;
}

export function apiKeyProblems() {
  const problems = [];
  if (!apiKeySource()) problems.push(`ANTHROPIC_API_KEY is not set; add ANTHROPIC_API_KEY=<key> to ${ENV_FILE} (see .template.env)`);
  // The shell's key wins over .env, which can bill a different account than intended.
  if (process.env.ANTHROPIC_API_KEY && dotenv.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== dotenv.ANTHROPIC_API_KEY) {
    problems.push('ANTHROPIC_API_KEY is set both in your shell and in .env, with different values; the shell value would be used. Unset one.');
  }
  return problems;
}

// Advice that does not block a run.
export function envFileWarnings() {
  if (!existsSync(ENV_FILE)) return [];
  return (statSync(ENV_FILE).mode & 0o077) ? [`${ENV_FILE} is readable by other users; consider: chmod 600 ${ENV_FILE}`] : [];
}

export function readApiKey() {
  const problems = apiKeyProblems();
  if (problems.length) throw new Error(problems.join('; '));
  return process.env.ANTHROPIC_API_KEY || dotenv.ANTHROPIC_API_KEY;
}

// Prices in $ per million tokens (claude-api skill, cached 2026-10-06). Cache
// writes cost 1.25x input for the 5-minute TTL and 2x for 1 hour; the Batch
// API halves everything. A model missing here has unknown cost, never a guess.
export const PRICES = {
  'claude-fable-5-1': { in: 10, out: 50, read: 0.25 },
  'claude-opus-5-5': { in: 4, out: 20, read: 0.2 },
  'claude-sonnet-5-5': { in: 2, out: 10, read: 0.2 },
};
