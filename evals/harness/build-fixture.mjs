#!/usr/bin/env node
// Build a runnable fixture project from a reviewed fixture spec. No model runs.
//
//   node build-fixture.mjs <spec-dir> --out <dir> [--client claude|codex] [--commit <sha>]
//
// A spec dir (evals/fixtures/<role>/<id>/, or fixtures/_bases/<name>/
// for a shared base) holds spec.json and layer directories of real files. The
// build is deterministic:
//   1. export the framework at a pinned commit with `git archive` (so untracked
//      files in the working checkout, such as .DS_Store, never reach a fixture);
//   2. git init the project and apply "pre-install" layers (for example project
//      instructions that the installer must merge with);
//   3. run the real installer from the exported framework;
//   4. apply the remaining layers in order: commit, stage, leave unstaged,
//      leave untracked, delete, branch, or set git config;
//   5. run check.mjs and compare with spec.expectCheck.
// A spec may name a shared base ("base": "<name>"): the base's layers (and its
// own base's, recursively) come first, then the case's. A case records the
// content hash of each base it was reviewed with, so a changed base makes the
// case stale until it is re-reviewed.
// spec.json, grader-only facts, and deterministic checks stay outside the
// project directory so the agent under test cannot read them.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { DEFAULT_COMMIT, FIXTURES_ROOT, findCase, hashOf } from './lib/cases.mjs';
import { frameworkAt } from './lib/framework.mjs';
import { git, manifest, runCheck, snapshot } from './lib/snapshot.mjs';

export const BASES_DIR = path.join(FIXTURES_ROOT, '_bases');
// macOS Finder writes .DS_Store into folders it shows. No fixture has one on
// purpose, so a layer's .DS_Store never reaches a build or a spec's hash.
export const FINDER_FILE = '.DS_Store';

function parseArgs(argv) {
  const args = { client: 'claude', commit: DEFAULT_COMMIT };
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out') args.out = argv[++i];
    else if (argv[i] === '--client') args.client = argv[++i];
    else if (argv[i] === '--commit') args.commit = argv[++i];
    else if (argv[i] === '--allow-stale') args.allowStale = true;
    else rest.push(argv[i]);
  }
  [args.specDir] = rest;
  if (!args.specDir || !args.out) throw new Error('usage: build-fixture.mjs <spec-dir> --out <dir> [--client claude|codex] [--commit <sha>]');
  return args;
}

// frameworkAt lives in lib/framework.mjs (snapshot.mjs needs it too); re-exported here.
export { frameworkAt } from './lib/framework.mjs';

// Content hash of a spec dir (spec.json plus every layer file), used to
// freeze the bases a case was reviewed with.
export function specDirHash(dir) {
  const files = {};
  const walk = (rel) => {
    for (const name of readdirSync(path.join(dir, rel)).sort()) {
      if (name === FINDER_FILE) continue;
      const r = rel ? `${rel}/${name}` : name;
      const st = lstatSync(path.join(dir, r));
      if (st.isDirectory()) walk(r);
      else files[r] = st.isSymbolicLink() ? `symlink:${execFileSync('readlink', [path.join(dir, r)], { encoding: 'utf8' }).trim()}` : `${(st.mode & 0o111) ? 'x' : '-'}${hashOf(readFileSync(path.join(dir, r), 'latin1'))}`;
    }
  };
  if (existsSync(path.join(dir, 'layers'))) walk('layers');
  // Every spec field that changes the build or the grading of cases on it;
  // not status, review, or notes, so reviewing a base does not make its cases stale.
  const spec = JSON.parse(readFileSync(path.join(dir, 'spec.json'), 'utf8'));
  files['spec.json'] = hashOf({ base: spec.base ?? null, layers: spec.layers ?? null, install: spec.install ?? null, vars: spec.vars ?? null, expectCheck: spec.expectCheck ?? null, date: spec.date ?? null, branch: spec.branch ?? null });
  return hashOf(files);
}

// Resolve a spec and its bases into one ordered layer list. Each layer keeps
// the spec dir it came from, so its `dir` resolves there.
export function resolveSpec(specDir, seen = []) {
  const spec = JSON.parse(readFileSync(path.join(specDir, 'spec.json'), 'utf8'));
  const own = (spec.layers ?? []).map((l) => ({ ...l, from: specDir }));
  if (!spec.base) return { spec, layers: own, install: spec.install ?? {}, vars: spec.vars ?? {}, bases: [], runtime: spec.runtime ?? {} };
  if (seen.includes(spec.base)) throw new Error(`base cycle: ${[...seen, spec.base].join(' -> ')}`);
  const baseDir = path.join(BASES_DIR, spec.base);
  if (!existsSync(path.join(baseDir, 'spec.json'))) throw new Error(`unknown base ${spec.base}`);
  const parent = resolveSpec(baseDir, [...seen, spec.base]);
  return {
    spec,
    layers: [...parent.layers, ...own],
    install: { ...parent.install, ...(spec.install ?? {}) },
    vars: { ...parent.vars, ...(spec.vars ?? {}) },
    bases: [...parent.bases, { name: spec.base, hash: specDirHash(baseDir) }],
    // Runtime needs are the case's own; a base never runs by itself.
    runtime: spec.runtime ?? {},
  };
}

// pnpm workspaces install offline: they have no external dependencies, and
// the lockfile this writes is committed with the layer that adds them.
function pnpmInstall(dir) {
  const store = path.join(os.tmpdir(), 'standards-eval-pnpm');
  execFileSync('pnpm', ['install', '--offline', '--store-dir', path.join(store, 'store'), `--config.cache-dir=${path.join(store, 'cache')}`,
    '--config.manage-package-manager-versions=false', '--reporter=silent'], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, CI: '1' } });
}

// Specs in a chain whose recorded parents changed after they were reviewed (a
// parent base fixed or regenerated): the spec itself and every base under it.
// Each must be reviewed again before anything is built on it.
export function staleBases(specDir) {
  const out = [];
  const dirs = [specDir, ...resolveSpec(specDir).bases.map((x) => path.join(BASES_DIR, x.name))];
  for (const d of dirs) {
    const s = JSON.parse(readFileSync(path.join(d, 'spec.json'), 'utf8'));
    if (!s.baseHashes) continue;
    for (const p of resolveSpec(d).bases) if (s.baseHashes[p.name] !== p.hash) out.push({ spec: d === specDir ? (s.case ?? `base:${path.basename(d)}`) : `base:${path.basename(d)}`, parent: p.name });
  }
  return out;
}

// allowStale skips both freezes (the self-test's historical specs);
// allowStaleBases skips only the base freeze, for a re-review of a case whose
// base was fixed (the review then records the new base hashes); allowStaleCase
// skips only the case freeze, for rebuilding the reviewed build of a case whose
// text has since changed (migrate-fixtures.mjs).
export function buildFixture({ specDir, out, client = 'claude', commit = DEFAULT_COMMIT, allowStale = false, allowStaleBases = false, allowStaleCase = false }) {
  const started = Date.now();
  const resolved = resolveSpec(specDir);
  const { spec } = resolved;
  const problems = [];
  let kase = null;
  if (spec.case) {
    kase = findCase(spec.case);
    // A fixture reviewed against an older prompt or assertion list is stale.
    if (spec.caseHash !== kase.hash && !allowStale && !allowStaleCase) {
      throw new Error(`${spec.case}: case changed since the fixture was written (spec ${spec.caseHash}, case ${kase.hash}); regenerate or re-review`);
    }
  }
  // A base changed after this spec recorded it: the review no longer covers it.
  // Every base in the chain must match what the spec recorded, including a
  // parent the spec has never seen.
  if (spec.baseHashes && !allowStale && !allowStaleBases) {
    for (const b of resolved.bases) {
      if (spec.baseHashes[b.name] !== b.hash) throw new Error(`${spec.case ?? specDir}: base ${b.name} changed since this spec was written (${spec.baseHashes[b.name] ?? 'not recorded'} -> ${b.hash}); re-review`);
    }
  }
  // A base under this spec whose own parent changed since that base was reviewed.
  if (!allowStale && !allowStaleBases) {
    const stale = staleBases(specDir).filter((x) => x.spec.startsWith('base:'));
    if (stale.length) throw new Error(`${spec.case ?? specDir}: ${stale.map((x) => `${x.spec}'s parent ${x.parent} changed since it was reviewed`).join('; ')}; re-review it first`);
  }
  const framework = frameworkAt(commit);

  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  // Fixed identity and dates make commit hashes reproducible across builds.
  const env = {
    ...process.env,
    GIT_AUTHOR_NAME: 'Fixture', GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
    GIT_COMMITTER_NAME: 'Fixture', GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
    GIT_AUTHOR_DATE: spec.date ?? '2026-09-24T09:00:00Z', GIT_COMMITTER_DATE: spec.date ?? '2026-09-24T09:00:00Z',
  };
  const g = (args) => git(out, args, { env });
  g(['init', '-q', '--template=', '-b', spec.branch ?? 'main']); // no sample hooks in fixtures
  g(['config', 'user.name', 'Fixture']);
  g(['config', 'user.email', 'fixture@example.invalid']);
  g(['config', 'commit.gpgsign', 'false']);

  const applyLayer = (layer) => {
    const src = layer.dir && path.join(layer.from, layer.dir);
    if (src && !existsSync(src)) throw new Error(`layer dir missing: ${layer.dir} (in ${layer.from})`);
    // Never write through a symlink an earlier layer created: a link to a
    // path outside the fixture would let a layer write outside it on the host.
    if (src) {
      for (const rel of layerFiles(src)) {
        const parts = rel.split('/');
        for (let k = 1; k < parts.length; k += 1) {
          const p = path.join(out, ...parts.slice(0, k));
          if (existsSync(p) && lstatSync(p).isSymbolicLink()) throw new Error(`layer ${layer.dir} writes ${rel} through the symlink ${parts.slice(0, k).join('/')}`);
        }
      }
    }
    // verbatimSymlinks: a relative link stays relative (the project is mounted elsewhere).
    if (src) cpSync(src, out, { recursive: true, force: true, verbatimSymlinks: true, filter: (p) => path.basename(p) !== FINDER_FILE });
    // Revision identities a record cites exist only once earlier layers are
    // committed: ${COMMIT:<subject>} becomes the full hash of the latest commit
    // with that exact subject, ${BLOB:<path>} the git blob hash of that file as
    // it is now. Builds are deterministic, so the values are the same each time.
    if (src) {
      for (const rel of layerFiles(src)) {
        const f = path.join(out, rel);
        if (lstatSync(f).isSymbolicLink()) continue;
        const text = readFileSync(f, 'utf8');
        if (!/\$\{(COMMIT|BLOB):/.test(text)) continue;
        const subjects = execFileSync('git', ['log', '--all', '--format=%H%x09%s'], { cwd: out, encoding: 'utf8', env }).trim().split('\n').filter(Boolean).map((l) => l.split('\t'));
        writeFileSync(f, text.replace(/\$\{(COMMIT|BLOB):([^}]+)\}/g, (m, kind, arg) => {
          if (kind === 'COMMIT') {
            const hit = subjects.find(([, s]) => s === arg);
            if (hit) return hit[0];
            problems.push(`layer ${layer.dir}: ${rel} cites \${COMMIT:${arg}} but no earlier commit has that subject`);
            return m;
          }
          if (existsSync(path.join(out, arg))) return execFileSync('git', ['hash-object', '--', arg], { cwd: out, encoding: 'utf8' }).trim();
          problems.push(`layer ${layer.dir}: ${rel} cites \${BLOB:${arg}} but ${arg} does not exist`);
          return m;
        }));
      }
    }
    if (layer.pnpmInstall) {
      const ignore = existsSync(path.join(out, '.gitignore')) ? readFileSync(path.join(out, '.gitignore'), 'utf8') : '';
      if (!/^\/?node_modules\/?$/m.test(ignore)) problems.push(`layer ${layer.dir}: pnpmInstall needs node_modules in .gitignore`);
      pnpmInstall(out);
    }
    switch (layer.action) {
      case 'commit':
        g(['add', '-A']);
        g(['commit', '-q', '--allow-empty', '-m', layer.message ?? layer.dir]);
        break;
      case 'stage': // write then `git add` only this layer's files
        g(['add', '--', ...layerFiles(src)]);
        break;
      case 'unstaged': // tracked files modified in the working tree only
      case 'untracked': // new files never added
        break;
      case 'delete':
        for (const p of layer.paths) {
          if (layer.stage) g(['rm', '-q', '-r', '--', p]);
          else rmSync(path.join(out, p), { force: true, recursive: true });
        }
        break;
      case 'branch':
        g(['checkout', '-q', '-b', layer.name]);
        break;
      case 'checkout':
        g(['checkout', '-q', layer.name]);
        break;
      case 'git-config': // repository config, e.g. a diff driver (.git/config never comes from files)
        for (const [k, v] of Object.entries(layer.config ?? {})) g(['config', k, v]);
        break;
      default:
        throw new Error(`unknown layer action ${layer.action}`);
    }
  };

  const layers = resolved.layers;
  for (const layer of layers.filter((l) => l.phase === 'pre-install')) applyLayer(layer);
  if (!layers.some((l) => l.phase === 'pre-install' && l.action === 'commit')) {
    g(['commit', '-q', '--allow-empty', '-m', 'Initial commit']);
  }

  // The real installer, from the exported framework, never from the checkout.
  const install = resolved.install;
  execFileSync('node', [path.join(framework.dir, 'bin/standards.js'), 'install', '--yes',
    '--client', client, '--mode', install.mode ?? 'brownfield',
    install.hooks === false ? '--no-hooks' : '--hooks', '--project', out], { encoding: 'utf8' });
  g(['add', '-A']);
  g(['commit', '-q', '-m', install.message ?? 'Install STANDARDS']);

  for (const layer of layers.filter((l) => l.phase !== 'pre-install')) applyLayer(layer);

  // The fixture must pass (or deliberately fail) check.mjs as the spec says.
  const check = runCheck(out, { commit: framework.sha });
  const expect = spec.expectCheck ?? { ok: true };
  if (expect.ok === false && !(expect.problemsMatch ?? []).length) problems.push('expectCheck.ok is false but problemsMatch names no problems');
  if (check.ok !== expect.ok) problems.push(`check.mjs ok=${check.ok}, expected ${expect.ok}: ${JSON.stringify(check.problems)}`);
  // Exactly the expected problems: each pattern matches some problem, and
  // every problem matches some pattern (no unexpected extras).
  const patterns = (expect.problemsMatch ?? []).map((p) => new RegExp(p));
  for (const re of patterns) {
    if (!check.problems.some((p) => re.test(JSON.stringify(p)))) problems.push(`no check problem matches ${re}`);
  }
  if (patterns.length) {
    for (const p of check.problems) {
      if (!patterns.some((re) => re.test(JSON.stringify(p)))) problems.push(`unexpected check problem: ${JSON.stringify(p)}`);
    }
  }
  // A sentinel marker must not exist before the run, or its check means nothing.
  for (const s of resolved.runtime.sentinels ?? []) {
    if (existsSync(path.join(out, s.marker))) problems.push(`sentinel marker ${s.marker} already exists in the built fixture`);
  }
  // Content hash of the built project (files outside .git, plus HEAD), so two
  // builds of the same spec at the same commit can be shown identical.
  // The index and status are included, so staged versus unstaged differs.
  const fixtureHash = hashOf({ files: manifest(out), head: git(out, ['rev-parse', 'HEAD']),
    index: git(out, ['ls-files', '-s']), status: git(out, ['status', '--porcelain=v1', '-uall']) });
  // Commit subjects -> full hashes (the latest commit with each subject), so a
  // check can name a revision as ${COMMIT:<subject>}; grade.mjs resolves it
  // from the run's own fixture.json.
  const commits = {};
  for (const line of git(out, ['log', '--all', '--format=%H%x09%s']).split('\n').filter(Boolean)) {
    const [h, ...s] = line.split('\t');
    commits[s.join('\t')] ??= h;
  }
  return { case: spec.case ?? null, base: spec.base ?? null, bases: resolved.bases, caseHash: kase?.hash ?? null, fixtureHash, framework: framework.sha, client, out, check, problems, revisions: { commits }, ms: Date.now() - started };
}

// Files a layer directory contributes, relative to the project root.
function layerFiles(src) {
  return execFileSync('find', ['.', '(', '-type', 'f', '-o', '-type', 'l', ')', '!', '-name', FINDER_FILE], { cwd: src, encoding: 'utf8' })
    .split('\n').filter(Boolean).map((f) => f.replace(/^\.\//, ''));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs(process.argv.slice(2));
  const result = buildFixture(args);
  const snap = await snapshot(args.out, { commit: args.commit });
  // Build metadata goes next to the fixture, never inside it.
  const metaDir = mkdtempSync(path.join(os.tmpdir(), 'fixture-meta-'));
  writeFileSync(path.join(metaDir, 'build.json'), JSON.stringify({ ...result, snapshot: snap }, null, 2));
  console.log(JSON.stringify({ case: result.case, base: result.base, ok: result.problems.length === 0, problems: result.problems, ms: result.ms, files: Object.keys(snap.files).length, status: snap.status, meta: metaDir }, null, 2));
  process.exit(result.problems.length ? 1 : 0);
}
