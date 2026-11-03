// The framework at a pinned commit, exported once per commit into a cache
// under $TMPDIR, and its pristine runtime (what the installer copies to
// .standards/bin). The harness reads and checks every fixture with the
// pristine runtime, never with the project's own copy: a role could edit that
// copy, and the harness runs on the host.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, rmSync, symlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { DEFAULT_COMMIT, REPO_ROOT } from './cases.mjs';

const git = (dir, args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trimEnd();

export function frameworkAt(commit) {
  const sha = git(REPO_ROOT, ['rev-parse', commit]);
  // -h: exported with the harness's hermetic git settings (lib/config.mjs), so
  // an export an older harness made under the user's git config (CRLF line
  // endings with core.autocrlf, for example) is never reused.
  const dir = path.join(os.tmpdir(), 'standards-eval-framework', `${sha}-h`);
  if (!existsSync(path.join(dir, 'bin/standards.js'))) {
    // Extracted beside the cache and renamed into place, so processes that
    // export the same commit at once (migrate's workers) never see a partial
    // copy or write over each other's files.
    const tmp = `${dir}.tmp-${process.pid}`;
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp, { recursive: true });
    const tar = execFileSync('git', ['archive', sha], { cwd: REPO_ROOT, maxBuffer: 1 << 28 });
    execFileSync('tar', ['-x', '-C', tmp], { input: tar });
    try { renameSync(tmp, dir); } catch { rmSync(tmp, { recursive: true, force: true }); } // another process got there first
  }
  // The installer imports @clack/prompts. git archive has no node_modules, so
  // borrow the checkout's (pinned by pnpm-lock.yaml; the runtime tools have no
  // dependencies, so nothing from node_modules reaches the fixture).
  const modules = path.join(dir, 'node_modules');
  try { if (!existsSync(modules)) symlinkSync(path.join(REPO_ROOT, 'node_modules'), modules); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  return { sha, dir };
}


export const pristineRuntime = (commit = DEFAULT_COMMIT) => path.join(frameworkAt(commit).dir, 'runtime');
