// Whether a fixture can run at the framework commit under test, and if not,
// why: the rules run.mjs enforces before a run, decided from the specs alone
// (no build). `pnpm evals fixtures status`, `generate --needed`,
// `review --needed`, `check`, and `run --role/--all` all ask here, so they
// agree with each other and with the runner.
//
// States, in the order they are decided:
//   deferred    catalog/deferred.json lists the case, or the owner deferred it
//   missing     no fixture spec yet
//   stale       the case text changed since the fixture was written
//   regenerate  a migration found it failing gates 1-2
//   base        a base under it is not ready (regenerating, waiting for a
//               review or a decision, or migrated without its selfChecks)
//   review      waiting for its gate-3 review (gated), or a base changed
//               since its review
//   draft, flagged   waiting for the owner (pnpm evals fixtures flags)
//   migrate     reviewed for another framework commit, or carried over
//               without running its selfChecks
//   ready       runs
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { BASES_DIR, resolveSpec } from '../build-fixture.mjs';
import { EVALS_ROOT, FIXTURES_ROOT, REPO_ROOT } from './cases.mjs';

const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));

// A spec's own status at `sha`, before its bases are considered.
function ownState(spec, sha) {
  if (spec.needsRegeneration) return { state: 'regenerate', why: spec.gateProblems?.[0] ?? spec.needsRegeneration.reason };
  if (spec.status === 'gated') return { state: 'review', why: 'passed gates 1-2; waiting for its gate-3 review' };
  if (spec.status === 'draft' || spec.status === 'flagged') return { state: spec.status, why: 'waiting for your decision (pnpm evals fixtures flags)' };
  if (spec.status !== 'reviewed') return { state: spec.status ?? 'unmarked', why: `status ${spec.status ?? 'unmarked'}` };
  if ((spec.reviewedBy?.commit ?? spec.generatedBy?.commit) !== sha) return { state: 'migrate', why: 'reviewed for another framework commit: pnpm evals fixtures migrate' };
  const carried = spec.reviewedBy?.carriedOver;
  if (carried?.commit === sha && /^not run/.test(carried.selfChecks ?? '')) {
    return { state: 'migrate', why: 'carried over without running its selfChecks: pnpm evals fixtures migrate (with Docker)' };
  }
  return { state: 'ready', why: '' };
}

// Bases a spec builds on, with the hash each has now; a missing or broken
// base chain is reported, not thrown.
function basesOf(dir) {
  try { return { bases: resolveSpec(dir).bases }; } catch (error) { return { error: error.message }; }
}

const baseCache = new Map();
export function baseState(name, sha) {
  const key = `${name}@${sha}`;
  if (baseCache.has(key)) return baseCache.get(key);
  const dir = path.join(BASES_DIR, name);
  let result;
  if (!existsSync(path.join(dir, 'spec.json'))) result = { state: 'missing', why: `base ${name} has no spec` };
  else result = withBases(readJson(path.join(dir, 'spec.json')), dir, sha);
  baseCache.set(key, result);
  return result;
}

// The spec's own state, then each base under it: a base must be ready, and
// the spec must have been reviewed (or carried over) against the base as it is.
function withBases(spec, dir, sha) {
  const own = ownState(spec, sha);
  if (own.state !== 'ready') return own;
  const { bases, error } = basesOf(dir);
  if (error) return { state: 'base', why: error };
  for (const b of bases) {
    const bs = baseState(b.name, sha);
    if (bs.state !== 'ready') return { state: 'base', why: `base ${b.name}: ${bs.state} (${bs.why})` };
    if (spec.baseHashes && spec.baseHashes[b.name] !== b.hash) return { state: 'review', why: `base ${b.name} changed since this fixture's review` };
  }
  return own;
}

export function caseState(kase, sha) {
  const deferred = readJson(path.join(EVALS_ROOT, 'catalog/deferred.json')).deferred;
  if (deferred[kase.key]) return { state: 'deferred', why: deferred[kase.key] };
  const dir = path.join(FIXTURES_ROOT, kase.role, String(kase.id));
  if (!existsSync(path.join(dir, 'spec.json'))) return { state: 'missing', why: 'no fixture spec yet' };
  const spec = readJson(path.join(dir, 'spec.json'));
  if (spec.status === 'rejected') return { state: 'deferred', why: `fixture deferred by the owner: ${spec.decision?.note ?? ''}`, spec };
  if (spec.caseHash !== kase.hash) return { state: 'stale', why: 'the case text changed since this fixture was written', spec };
  return { ...withBases(spec, dir, sha), spec };
}

// Fixture files the user's `git add evals/` would leave out (an ignore rule in
// the repository, in a fixture's own layer, or in the user's global git
// config), so a clone would build those fixtures differently than reviewed.
// Each spec dir's generation log, the decision logs, and .DS_Store are local
// by design. Run with the user's own git environment (config.userGitEnv).
const LOCAL = /^[^/]+\/[^/]+\/gen\/|^(decisions\.jsonl|regenerate-notes\.json)$|(^|\/)\.DS_Store$/;
export function uncommittableFixtureFiles(env = process.env) {
  const rel = path.relative(REPO_ROOT, FIXTURES_ROOT);
  if (!existsSync(FIXTURES_ROOT) || rel.startsWith('..')) return [];
  const onDisk = execFileSync('find', ['.', '-type', 'f', '-o', '-type', 'l'], { cwd: FIXTURES_ROOT, encoding: 'utf8', maxBuffer: 1 << 26 })
    .split('\n').filter(Boolean).map((f) => f.replace(/^\.\//, '')).filter((f) => !LOCAL.test(f));
  // Tracked files (force-added ones included), plus untracked files no ignore rule hides.
  const seen = new Set(execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', rel], { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 1 << 26, env })
    .split('\0').filter(Boolean).map((f) => path.relative(rel, f)));
  return onDisk.filter((f) => !seen.has(f)).map((f) => path.join(rel, f));
}
