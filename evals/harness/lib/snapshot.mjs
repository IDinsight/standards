// Capture a fixture's state before and after a run: a content manifest of every
// file outside .git, git status and HEAD, and the parsed workflow state. The
// parsers and checks come from the pinned framework's pristine runtime (the
// same code the installer put in .standards/bin), never from the project's own
// copy: a role may have edited that copy, and this runs on the host.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { pristineRuntime } from './framework.mjs';

export const git = (dir, args, opts = {}) => execFileSync('git', args, {
  cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts,
}).trimEnd();

// Git config in a run's repository that would run commands during the
// host-side inspection after the run, beyond what the harness switches off
// (fsmonitor through lib/config.mjs, diff helpers through --no-ext-diff and
// --no-textconv): clean, smudge, or process filters, and config includes,
// which could pull such settings from a file the role wrote. Reading the
// config file this way runs nothing.
export function unsafeGitConfig(repo) {
  const file = path.join(repo, '.git', 'config');
  if (!existsSync(file)) return [];
  try {
    return git(repo, ['config', '--file', file, '--name-only', '--get-regexp', '^(filter|include|includeif)\\.']).split('\n').filter(Boolean);
  } catch { return []; } // exit 1: no such key
}

// Generated caches a correct run may create just by running code or tests.
// They are listed separately and never count as a change to the project.
// node_modules is listed with them: installed dependencies are not project
// content, and pnpm workspaces link them in cycles. So is a Python virtual
// environment under any name (a directory holding pyvenv.cfg): thousands of
// installed files, with links to directories such as lib64 -> lib.
export const CACHE_DIRS = new Set(['__pycache__', '.pytest_cache', '.mypy_cache', '.ruff_cache', '.cache', '.eslintcache', 'node_modules']);

// Recursive file list relative to root, skipping .git and caches.
function walk(root, rel = '', caches = []) {
  const out = [];
  for (const name of readdirSync(path.join(root, rel))) {
    if (name === '.git') continue;
    const relPath = rel ? `${rel}/${name}` : name;
    if (CACHE_DIRS.has(name)) { caches.push(relPath); continue; }
    // lstat: never follow symlinks (a link is recorded as itself, by target).
    const st = lstatSync(path.join(root, relPath), { throwIfNoEntry: false });
    if (!st) continue;
    if (st.isDirectory() && existsSync(path.join(root, relPath, 'pyvenv.cfg'))) caches.push(relPath);
    else if (st.isDirectory()) out.push(...walk(root, relPath, caches));
    else out.push(relPath);
  }
  return out.sort();
}

export function manifest(root, caches = []) {
  const files = {};
  for (const rel of walk(root, '', caches)) {
    const full = path.join(root, rel);
    let buf;
    try {
      buf = lstatSync(full).isSymbolicLink() ? Buffer.from(`symlink -> ${readlinkSync(full)}`) : readFileSync(full);
    } catch (error) {
      // A file the harness can't read (for example mode 000) is recorded, not fatal.
      buf = Buffer.from(`unreadable: ${error.code}`);
    }
    files[rel] = createHash('sha256').update(buf).digest('hex').slice(0, 16);
  }
  return files;
}

// State, the turn-end check, and the full check (what `check.mjs --json`
// reports), read by the pristine runtime in a fresh process with a time limit.
function inspectRuntime(root, commit) {
  try {
    return JSON.parse(execFileSync('node', [fileURLToPath(new URL('./inspect-runtime.mjs', import.meta.url)), root, pristineRuntime(commit)],
      { encoding: 'utf8', maxBuffer: 1 << 26, timeout: 120_000, stdio: ['ignore', 'pipe', 'pipe'] }));
  } catch (error) {
    const problem = (what) => ({ ok: false, problems: [{ message: `${what} did not run: ${error.message}` }], notes: [] });
    return { state: null, checkTurnEnd: problem('turn-end check'), check: problem('check.mjs') };
  }
}

// Full check, as a role runs it before a handoff (`check.mjs --json`).
export const runCheck = (root, { commit } = {}) => inspectRuntime(root, commit).check;

export async function snapshot(root, { commit } = {}) {
  const caches = [];
  const files = manifest(root, caches);
  const runtime = inspectRuntime(root, commit);
  return {
    head: git(root, ['rev-parse', 'HEAD']),
    status: git(root, ['status', '--porcelain=v1', '-uall']).split('\n').filter(Boolean),
    files,
    caches,
    state: runtime.state,
    // Raw text for the judge; parsed fields above are for deterministic checks.
    stateText: existsSync(path.join(root, '.standards/STATE.md')) ? readFileSync(path.join(root, '.standards/STATE.md'), 'utf8') : null,
    check: runtime.check,
    checkTurnEnd: runtime.checkTurnEnd,
  };
}

// File-level diff between two manifests.
export function diffManifests(before, after) {
  const added = Object.keys(after).filter((f) => !(f in before));
  const removed = Object.keys(before).filter((f) => !(f in after));
  const changed = Object.keys(after).filter((f) => f in before && before[f] !== after[f]);
  return { added, removed, changed };
}
