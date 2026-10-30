// A spec's `runtime` block: what a case needs from its environment beyond
// files, turned into a per-run /opt/eval directory and `docker run` arguments.
//
//   runtime: {
//     projectPath: "/work/bootstrap-demo",     // where the project is mounted (default /work)
//     blockHosts: ["api.prod.example.com"],    // unreachable hosts, on top of the GitHub hosts
//     standardsCli: { mode: "shim" }           // `standards` on PATH, running the pinned framework export
//                 | { mode: "stub", script: "runtime/standards" },  // a spec-provided stub instead
//     hideCommands: ["standards", "npx"],      // removed from PATH (command -v fails)
//     unreadable: ["docs/usage.md"],           // mode 000 inside the container for the run, restored after
//     sentinels: [{ marker: ".migrations/applied.log", why: "the migration script writes this when it runs" }],
//     outsideDirs: ["/outside"],               // writable directories outside the project (never under projectPath)
//     image: "browser",                        // the Playwright + Chromium image (Dockerfile.browser)
//     noGit: true,                             // the role sees no .git (restored after the run for the graders)
//     midRunEdits: [{                          // files another process changes during the run (once each)
//       after: { tool: "Write|Edit", path: ".standards/docs/documentation/*.md" },  // or { tool: "Bash", command: "<regex>" }
//       files: { "docs/usage.md": "runtime/usage-after.md" },                    // project path -> spec file
//       why: "the default changes after the doc checks, before the conclusion" }],
//   }
//
// Sentinels are ordinary fixture files whose normal behavior, when executed,
// writes a marker inside the project; the builder checks the marker is absent
// and the grader adds an `absent` invariant for each one.
import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { REPO_ROOT } from './cases.mjs';
import { BROWSER_IMAGE, IMAGE } from './config.mjs';
import { CACHE_DIRS } from './snapshot.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// Hosts unreachable in every run and selfCheck (GitHub, so a role cannot fetch
// the framework or a published solution); a case's runtime.blockHosts adds to
// them. run.mjs --block-hosts replaces this list for runs.
export const DEFAULT_BLOCK_HOSTS = ['github.com', 'api.github.com', 'raw.githubusercontent.com', 'codeload.github.com', 'objects.githubusercontent.com', 'gist.github.com'];
export const blockHostArgs = (hosts) => hosts.flatMap((h) => ['--add-host', `${h}:0.0.0.0`]);
export const RUNTIME_KEYS = new Set(['projectPath', 'blockHosts', 'standardsCli', 'hideCommands', 'unreadable', 'sentinels', 'outsideDirs', 'midRunEdits', 'noGit', 'image']);
// Runner image for a case: "browser" (Playwright with Chromium, Dockerfile.browser)
// for cases that need a real browser; otherwise the default image.
export { BROWSER_IMAGE };
export const imageFor = (runtime = {}, image = IMAGE) => (runtime.image === 'browser' ? BROWSER_IMAGE : image);

// Problems with a runtime block, for the spec validator (gate 1).
export function runtimeProblems(runtime = {}, specDir = null) {
  const p = [];
  for (const k of Object.keys(runtime)) if (!RUNTIME_KEYS.has(k)) p.push(`runtime: unknown key ${k}`);
  if (runtime.projectPath && !/^\/work(\/[\w.-]+)*$/.test(runtime.projectPath)) p.push('runtime.projectPath must be /work or a path under it');
  const cli = runtime.standardsCli;
  if (cli && !['shim', 'stub'].includes(cli.mode)) p.push('runtime.standardsCli.mode must be shim or stub');
  if (cli?.mode === 'stub' && !/^runtime\/[\w.-]+$/.test(cli.script ?? '')) p.push(`runtime.standardsCli.script must be runtime/<name>: ${cli?.script}`);
  else if (cli?.mode === 'stub' && specDir && !existsSync(path.join(specDir, cli.script))) p.push(`runtime.standardsCli.script missing: ${cli.script}`);
  if (cli && (runtime.hideCommands ?? []).includes('standards')) p.push('runtime: standardsCli and hideCommands both name standards');
  for (const s of runtime.sentinels ?? []) {
    if (!s.marker || path.isAbsolute(s.marker) || s.marker.split('/').includes('..')) p.push(`runtime.sentinels: marker must be a project-relative path: ${JSON.stringify(s)}`);
    // The graders' file manifest leaves out .git and cache folders, so a marker there could never be seen.
    else if (s.marker.split('/').some((seg) => seg === '.git' || CACHE_DIRS.has(seg))) p.push(`runtime.sentinels: marker ${s.marker} is under .git or a cache folder the graders ignore`);
  }
  for (const u of runtime.unreadable ?? []) if (path.isAbsolute(u) || u.includes('..')) p.push(`runtime.unreadable must be project-relative: ${u}`);
  const root = runtime.projectPath ?? '/work';
  const within = (a, b) => a === b || a.startsWith(`${b}/`);
  for (const d of runtime.outsideDirs ?? []) {
    if (!path.isAbsolute(d)) p.push(`runtime.outsideDirs must be absolute: ${d}`);
    // Inside the project it would be copied back as project files; containing it, it would hide the project.
    else if (within(path.normalize(d), root) || within(root, path.normalize(d)) || ['/', '/opt', '/opt/eval', '/mnt', '/mnt/project', '/home', '/home/runner'].some((x) => within(path.normalize(d), x) && x !== '/')) p.push(`runtime.outsideDirs must lie outside ${root} and the harness mounts: ${d}`);
  }
  if (runtime.noGit !== undefined && typeof runtime.noGit !== 'boolean') p.push('runtime.noGit must be true or false');
  if (runtime.image !== undefined && runtime.image !== 'browser') p.push('runtime.image must be "browser" (or absent for the default image)');
  // Mid-run edits: a trigger on a tool call, and project files replaced by spec files under runtime/.
  const projectRel = (x) => typeof x === 'string' && x && !path.isAbsolute(x) && !x.split('/').includes('..');
  for (const [n, e] of (runtime.midRunEdits ?? []).entries()) {
    const at = `runtime.midRunEdits[${n}]`;
    if (!e?.after || typeof e.after.tool !== 'string' || !e.after.tool) { p.push(`${at}.after.tool must name the triggering tool (a regex such as "Read" or "Write|Edit")`); continue; }
    try { new RegExp(e.after.tool); if (e.after.command) new RegExp(e.after.command); } catch (error) { p.push(`${at}.after: invalid regex: ${error.message}`); }
    if (e.after.path !== undefined && !projectRel(e.after.path)) p.push(`${at}.after.path must be a project-relative glob: ${e.after.path}`);
    if (!e.after.path && !e.after.command) p.push(`${at}.after needs a path or a command, so the edit fires at a defined point`);
    const files = Object.entries(e.files ?? {});
    if (!files.length) p.push(`${at}.files must map at least one project path to a spec file`);
    for (const [target, src] of files) {
      if (!projectRel(target) || target.split('/')[0] === '.git') p.push(`${at}.files: target must be a project-relative path outside .git: ${target}`);
      if (!/^runtime\/[\w./-]+$/.test(src ?? '') || src.split('/').includes('..')) p.push(`${at}.files: source must be a file under runtime/: ${src}`);
      else if (specDir && !existsSync(path.join(specDir, src))) p.push(`${at}.files: source missing: ${src}`);
    }
  }
  return p;
}

// The framework export for use inside the container: no host symlinks, and a
// flat node_modules with only the installer's production dependencies,
// copied (dereferenced) from the checkout's pnpm store.
// Cache layout version: bump when what the copy contains changes, so an
// older cached copy is never reused.
const CONTAINER_COPY_VERSION = 3;
const hasEvals = (dir) => existsSync(path.join(dir, 'skills')) && readdirSync(path.join(dir, 'skills')).some((r) => existsSync(path.join(dir, 'skills', r, 'evals')));
export function frameworkForContainer(frameworkDir, sha, { fresh = false } = {}) {
  const dir = path.join(os.tmpdir(), 'standards-eval-framework', `${sha}-container-v${CONTAINER_COPY_VERSION}`);
  if (!fresh && existsSync(path.join(dir, '.complete'))) {
    if (hasEvals(dir)) throw new Error(`${dir} contains skills/*/evals; refusing to mount it`);
    return dir;
  }
  rmSync(dir, { recursive: true, force: true });
  // Only what the npm package ships (package.json "files"), never
  // skills/*/evals/: the answer key must not be reachable from a run.
  const pkg = JSON.parse(readFileSync(path.join(frameworkDir, 'package.json'), 'utf8'));
  const shipped = new Set(['package.json', 'README.md', 'LICENSE', ...(pkg.files ?? []).filter((f) => !f.startsWith('!')).map((f) => f.replace(/\/$/, ''))]);
  cpSync(frameworkDir, dir, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(frameworkDir, src);
      if (!rel) return true;
      return shipped.has(rel.split(path.sep)[0]) && !/^skills\/[^/]+\/evals(\/|$)/.test(rel);
    },
  });
  const modules = path.join(dir, 'node_modules');
  mkdirSync(modules, { recursive: true });
  const done = new Set();
  const copyDep = (name, fromNodeModules) => {
    if (done.has(name)) return;
    done.add(name);
    const real = realpathSync(path.join(fromNodeModules, name));
    cpSync(real, path.join(modules, name), { recursive: true, dereference: true, filter: (src) => !path.relative(real, src).startsWith('node_modules') });
    // pnpm keeps a package's own dependencies next to it: <.pnpm/id>/node_modules/<dep>.
    const siblings = real.slice(0, real.length - name.length - 1);
    const pkg = JSON.parse(readFileSync(path.join(real, 'package.json'), 'utf8'));
    for (const d of Object.keys(pkg.dependencies ?? {})) copyDep(d, siblings);
  };
  const top = JSON.parse(readFileSync(path.join(frameworkDir, 'package.json'), 'utf8'));
  for (const d of Object.keys(top.dependencies ?? {})) copyDep(d, path.join(REPO_ROOT, 'node_modules'));
  if (hasEvals(dir)) throw new Error(`${dir} contains skills/*/evals; refusing to mount it`);
  writeFileSync(path.join(dir, '.complete'), '');
  return dir;
}

// Write the per-run /opt/eval directory (entry script, setup, runtime.json,
// bin/) and return the docker mounts it needs, and the user to start as (root
// only for unreadable files; entry.sh then runs the role as the runner).
export function prepareRuntime({ runtime = {}, specDir, evalDir, projectRoot, framework }) {
  rmSync(evalDir, { recursive: true, force: true });
  mkdirSync(path.join(evalDir, 'bin'), { recursive: true });
  for (const f of ['entry.sh', 'setup.mjs', 'drop.mjs']) cpSync(path.join(HERE, '../container', f), path.join(evalDir, f));
  writeFileSync(path.join(evalDir, 'runtime.json'), JSON.stringify({
    projectRoot, hideCommands: runtime.hideCommands ?? [], unreadable: runtime.unreadable ?? [], outsideDirs: runtime.outsideDirs ?? [], noGit: runtime.noGit === true,
  }, null, 2));
  const mounts = [];
  const cli = runtime.standardsCli;
  if (cli?.mode === 'shim') {
    writeFileSync(path.join(evalDir, 'bin/standards'), '#!/bin/sh\n# The pinned STANDARDS framework CLI.\nexec node /opt/standards/bin/standards.js "$@"\n');
    chmodSync(path.join(evalDir, 'bin/standards'), 0o755);
    mounts.push(['-v', `${frameworkForContainer(framework.dir, framework.sha)}:/opt/standards:ro`]);
  } else if (cli?.mode === 'stub') {
    cpSync(path.join(specDir, cli.script), path.join(evalDir, 'bin/standards'));
    chmodSync(path.join(evalDir, 'bin/standards'), 0o755);
  }
  // Mid-run edits: the hook and its config live in /opt/eval (read-only,
  // outside the project); Claude Code loads the hook through --settings.
  const claudeArgs = [];
  if ((runtime.midRunEdits ?? []).length) {
    cpSync(path.join(HERE, '../container/midrun.mjs'), path.join(evalDir, 'midrun.mjs'));
    const edits = runtime.midRunEdits.map((e, n) => ({
      after: e.after,
      files: Object.entries(e.files).map(([target, src], k) => {
        const dest = path.join(evalDir, 'midrun', String(n), `${k}-${path.basename(target)}`);
        mkdirSync(path.dirname(dest), { recursive: true });
        cpSync(path.join(specDir, src), dest);
        return { target, source: `/opt/eval/midrun/${n}/${k}-${path.basename(target)}` };
      }),
    }));
    writeFileSync(path.join(evalDir, 'midrun.json'), JSON.stringify({ projectRoot, edits }, null, 2));
    writeFileSync(path.join(evalDir, 'settings.json'), JSON.stringify({
      hooks: { PostToolUse: [{ matcher: '*', hooks: [{ type: 'command', command: 'node /opt/eval/midrun.mjs' }] }] },
    }, null, 2));
    claudeArgs.push('--settings', '/opt/eval/settings.json');
  }
  return { mounts: mounts.flat(), user: (runtime.unreadable ?? []).length ? ['--user', '0:0'] : [], claudeArgs };
}
