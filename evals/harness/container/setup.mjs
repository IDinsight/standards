// Runs inside the container before and after the role (see entry.sh): as the
// unprivileged runner, or as root for a case with unreadable files. Reads /opt/eval/runtime.json:
//   { projectRoot, hideCommands: [..], unreadable: [..], outsideDirs: [..], noGit }
//
//   node setup.mjs root     -> prints the project root the role works in
//   node setup.mjs before   -> prints the PATH the role gets
//   node setup.mjs after    -> restores file modes changed before the run
import { chmodSync, chownSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// EVAL_RUNTIME_DIR and EVAL_TMP exist for the self-test on the host.
const DIR = process.env.EVAL_RUNTIME_DIR ?? '/opt/eval';
const TMP = process.env.EVAL_TMP ?? '/tmp';
const cfg = JSON.parse(readFileSync(path.join(DIR, 'runtime.json'), 'utf8'));
const MODES = path.join(TMP, 'eval-modes.json');
// noGit: the project's .git is kept here during the run; the log goes with the run's session files.
const GIT_STASH = path.join(TMP, 'eval-git');
const NOGIT_LOG = process.env.EVAL_NOGIT_LOG ?? '/home/runner/.claude/projects/eval-nogit.json';
const move = (from, to) => { try { renameSync(from, to); } catch { cpSync(from, to, { recursive: true }); rmSync(from, { recursive: true, force: true }); } };
const [phase] = process.argv.slice(2);

if (phase === 'root') {
  process.stdout.write(cfg.projectRoot);
} else if (phase === 'before') {
  // Hidden commands: a PATH made of links to every executable on the normal
  // PATH except the hidden ones, so `command -v npx` really fails. The
  // harness's own bin (a standards shim or stub) comes first.
  let dirs = (process.env.PATH ?? '').split(':').filter(Boolean);
  const hide = new Set(cfg.hideCommands ?? []);
  if (hide.size) {
    const farm = path.join(TMP, 'eval-path');
    mkdirSync(farm, { recursive: true });
    for (const d of dirs) {
      let names;
      try { names = readdirSync(d); } catch { continue; }
      for (const n of names) {
        if (hide.has(n) || existsSync(path.join(farm, n))) continue;
        try { symlinkSync(path.join(d, n), path.join(farm, n)); } catch { /* first wins */ }
      }
    }
    dirs = [farm];
  }
  // Files the role must not be able to read (for example documenter-10):
  // root-owned with mode 000 for the run (the container started as root for
  // this; the role runs as the runner, so it can neither read nor chmod them),
  // restored afterwards.
  const root = process.getuid?.() === 0;
  const saved = {};
  for (const rel of cfg.unreadable ?? []) {
    const f = path.join(cfg.projectRoot, rel);
    const st = statSync(f);
    saved[f] = { mode: st.mode & 0o7777, uid: st.uid, gid: st.gid };
    if (root) chownSync(f, 0, 0);
    chmodSync(f, 0o000);
  }
  writeFileSync(MODES, JSON.stringify(saved));
  // Writable directories outside the project (for example a symlink target).
  for (const d of cfg.outsideDirs ?? []) {
    mkdirSync(d, { recursive: true });
    if (root) try { chownSync(d, 1001, 1001); } catch { /* a host mount keeps its owner */ }
  }
  // noGit (for example navigator-26, "a downloaded tree with no .git"): the role
  // sees no repository; the harness keeps .git aside and restores it after,
  // so graders still have HEAD and history.
  if (cfg.noGit && existsSync(path.join(cfg.projectRoot, '.git'))) move(path.join(cfg.projectRoot, '.git'), GIT_STASH);
  process.stdout.write([path.join(DIR, 'bin'), ...dirs].join(':'));
} else if (phase === 'after') {
  if (cfg.noGit && existsSync(GIT_STASH)) {
    // A .git the role created (git init) is recorded, then replaced by the original.
    const created = existsSync(path.join(cfg.projectRoot, '.git'));
    if (created) rmSync(path.join(cfg.projectRoot, '.git'), { recursive: true, force: true });
    move(GIT_STASH, path.join(cfg.projectRoot, '.git'));
    try { mkdirSync(path.dirname(NOGIT_LOG), { recursive: true }); writeFileSync(NOGIT_LOG, JSON.stringify({ roleCreatedGit: created })); } catch { /* evidence only */ }
  }
  if (existsSync(MODES)) {
    for (const [f, was] of Object.entries(JSON.parse(readFileSync(MODES, 'utf8')))) {
      if (process.getuid?.() === 0) chownSync(f, was.uid, was.gid);
      chmodSync(f, was.mode);
    }
  }
} else {
  throw new Error('usage: setup.mjs root|before|after');
}
