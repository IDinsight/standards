// Text the fixture generator and the fixture reviewer (gate 3) read: the
// pinned framework's protocol, templates, and runtime source; the role's
// skill; the sample specs; a spec directory; and a built fixture tree.
// Framework files come from the pinned commit (`git show <sha>:<path>`), never
// the working checkout.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { EVALS_ROOT, REPO_ROOT, SAMPLES_ROOT } from './cases.mjs';

const show = (sha, rel) => execFileSync('git', ['show', `${sha}:${rel}`], { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
const ls = (sha, dir) => execFileSync('git', ['ls-tree', '-r', '--name-only', sha, dir], { cwd: REPO_ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
const doc = (name, text) => `<file path="${name}">\n${text.replace(/\n?$/, '\n')}</file>`;

// Shared by every role: protocol, record templates, state templates, the
// runtime's parsers and checks, and the framework's own valid saved states
// with records (test/fixtures/upgrade: recovery, documenting, an incremental
// checkpoint, and, at later releases, more), kept to the current record
// contract by the framework's release checks.
export function sharedFrameworkText(sha) {
  const files = [
    'PROTOCOL.md', ...ls(sha, 'protocol'),
    ...ls(sha, 'templates').filter((f) => /\.(md|json)$/.test(f)),
    ...ls(sha, 'skills').filter((f) => f.endsWith('/template.md')),
    'runtime/lib/core.mjs', 'runtime/lib/state.mjs', 'runtime/lib/records.mjs', 'runtime/check.mjs', 'runtime/artifact.mjs', 'runtime/id.mjs', 'runtime/cycle.mjs',
    // The other checks check.mjs runs, where the commit has them: incremental
    // verification (0.8.0), completion policies and closure reviews (0.10.0).
    ...ls(sha, 'runtime/lib').filter((f) => /\/(verification|completion|review)\.mjs$/.test(f)),
    ...ls(sha, 'test/fixtures/upgrade'),
  ];
  return files.map((f) => doc(f, show(sha, f))).join('\n');
}

// The role under test: its skill and modes (styles are writing guidance for
// the role's own output and are left out).
export function roleText(sha, role) {
  const files = ls(sha, `skills/${role}`).filter((f) => !/\/evals\/|\/agents\/|\/styles\//.test(f));
  return files.map((f) => doc(f, show(sha, f))).join('\n');
}

// Every file of a spec directory (spec.json, layers/, runtime/), as text.
export function specDirText(dir, label = path.relative(EVALS_ROOT, dir)) {
  const out = [doc(`${label}/spec.json`, readFileSync(path.join(dir, 'spec.json'), 'utf8'))];
  for (const sub of ['layers', 'runtime']) {
    const root = path.join(dir, sub);
    if (!existsSync(root)) continue;
    for (const rel of walk(root)) {
      const full = path.join(root, rel);
      const st = lstatSync(full);
      const name = `${label}/${sub}/${rel}`;
      if (st.isSymbolicLink()) out.push(`<symlink path="${name}" target="${readlinkSync(full)}"/>`);
      else out.push(doc(`${name}${st.mode & 0o111 ? '" executable="true' : ''}`, readFileSync(full, 'utf8')));
    }
  }
  return out.join('\n');
}

export function samplesText() {
  return [['developer', 1], ['reviewer', 2], ['navigator', 3]]
    .map(([r, id]) => specDirText(path.join(SAMPLES_ROOT, r, String(id)), `sample ${r}-${id}`)).join('\n');
}

function walk(root, rel = '') {
  const out = [];
  for (const name of readdirSync(path.join(root, rel)).sort()) {
    if (name === '.DS_Store') continue;
    if (name === '.git') continue;
    const r = rel ? `${rel}/${name}` : name;
    const st = lstatSync(path.join(root, r));
    if (st.isDirectory()) out.push(...walk(root, r));
    else out.push(r);
  }
  return out;
}

const fileHash = (f) => {
  const st = lstatSync(f);
  return st.isSymbolicLink() ? `l:${readlinkSync(f)}` : createHash('sha256').update(readFileSync(f)).digest('hex');
};

// A pristine install at this commit, so a built tree can show installed
// framework files as "unchanged" instead of in full.
function pristine(sha, mode, frameworkDir) {
  const dir = path.join(os.tmpdir(), 'standards-eval-pristine', `${sha}-${mode}`);
  if (!existsSync(path.join(dir, '.standards/VERSION.json'))) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    execFileSync('git', ['init', '-q', dir]);
    execFileSync('node', [path.join(frameworkDir, 'bin/standards.js'), 'install', '--yes', '--client', 'claude', '--mode', mode, '--hooks', '--project', dir], { encoding: 'utf8' });
  }
  return Object.fromEntries(walk(dir).map((f) => [f, fileHash(path.join(dir, f))]));
}

const SKIP_DIRS = /(^|\/)(node_modules|__pycache__|\.pytest_cache)(\/|$)/;

// A built fixture as the reviewer sees it: git log, status, and every file
// that is not an unchanged installed framework file, in full (long files are
// cut in the middle with a marker).
export function builtTreeText(dir, { sha, mode = 'brownfield', frameworkDir, limit = 40_000 }) {
  const base = pristine(sha, mode, frameworkDir);
  const git = (args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', maxBuffer: 1 << 26 }).trimEnd();
  const files = walk(dir).filter((f) => !SKIP_DIRS.test(f));
  const same = files.filter((f) => base[f] && base[f] === fileHash(path.join(dir, f)));
  const shown = files.filter((f) => !same.includes(f));
  const parts = [
    // Installed framework paths are left out of the per-commit file lists.
    `<git_log note="file lists omit installed framework paths">\n${git(['log', '--name-status', '--format=commit %h %ad%n%s', '--date=iso', '--', '.', ':!.claude/skills', ':!.standards/bin', ':!.standards/protocol', ':!.standards/PROTOCOL.md'])}\n</git_log>`,
    `<git_status>\n${git(['status', '--porcelain=v1', '-uall', '--branch'])}\n</git_status>`,
    `<git_branches>\n${git(['branch', '-a'])}\n</git_branches>`,
    `<git_config_local>\n${git(['config', '--local', '--list'])}\n</git_config_local>`,
    `<installed_framework_files_unchanged count="${same.length}">\n${same.join('\n')}\n</installed_framework_files_unchanged>`,
  ];
  for (const f of shown) {
    const full = path.join(dir, f);
    const st = lstatSync(full);
    if (st.isSymbolicLink()) { parts.push(`<symlink path="${f}" target="${readlinkSync(full)}"/>`); continue; }
    let text;
    try { text = readFileSync(full, 'utf8'); } catch (e) { parts.push(`<file path="${f}" unreadable="${e.code}"/>`); continue; }
    if (text.length > limit) text = `${text.slice(0, limit / 2)}\n[... ${text.length - limit} characters cut ...]\n${text.slice(-limit / 2)}`;
    parts.push(doc(`${f}" mode="${(st.mode & 0o777).toString(8)}`, text));
  }
  return parts.join('\n');
}
