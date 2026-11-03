#!/usr/bin/env node
// Build and check the runner image. No model call. Needs Docker, so it runs
// outside the Code tab's sandbox.
//
//   node image.mjs build   pull the base image, pin it by digest, build the
//                          runner image (lib/config.mjs IMAGE, which names the
//                          pinned Claude Code version), record versions in
//                          image.json (gitignored)
//   node image.mjs check [--commit <sha>]   verify the image and the runtime block without a
//                          model: versions, unprivileged user, writable mounts,
//                          TypeScript by type stripping, pnpm offline, pytest,
//                          blocked hosts, hidden commands, an unreadable file,
//                          the standards shim, and the ~/.claude mount
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { frameworkAt } from './build-fixture.mjs';
import { DEFAULT_COMMIT } from './lib/cases.mjs';
import { BROWSER_IMAGE, CLAUDE_CODE_VERSION, IMAGE, PLAYWRIGHT_VERSION, PNPM_VERSION } from './lib/config.mjs';
import { prepareRuntime } from './lib/runtime.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'node:22-bookworm-slim';
const CLAUDE = CLAUDE_CODE_VERSION;
const PNPM = PNPM_VERSION;
const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();

function build() {
  console.log(`pulling ${BASE} ...`);
  execFileSync('docker', ['pull', BASE], { stdio: 'inherit' });
  const digest = sh('docker', ['image', 'inspect', '--format', '{{index .RepoDigests 0}}', BASE]);
  console.log(`building ${IMAGE} on ${digest} ...`);
  execFileSync('docker', ['build', '-t', IMAGE, '--build-arg', `BASE=${digest}`, '--build-arg', `CLAUDE_CODE_VERSION=${CLAUDE}`, '--build-arg', `PNPM_VERSION=${PNPM}`, HERE], { stdio: 'inherit' });
  const run = (...c) => sh('docker', ['run', '--rm', IMAGE, ...c]);
  const info = {
    image: IMAGE, imageId: sh('docker', ['image', 'inspect', '--format', '{{.Id}}', IMAGE]), base: digest,
    claude: run('claude', '--version'), node: run('node', '--version'), pnpm: run('pnpm', '--version'),
    git: run('git', '--version'), python: run('python3', '--version'), pytest: run('python3', '-m', 'pytest', '--version'),
    builtAt: new Date().toISOString(),
  };
  writeFileSync(path.join(HERE, 'image.json'), `${JSON.stringify(info, null, 2)}\n`);
  console.log(JSON.stringify(info, null, 2));
}

function check() {
  const results = [];
  const measured = [];
  const ok = (name, pass, detail = '') => { results.push({ name, pass }); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`); };
  const root = mkdtempSync(path.join(os.tmpdir(), 'image-check-'));
  const work = path.join(root, 'work');
  mkdirSync(path.join(work, 'src'), { recursive: true });
  mkdirSync(path.join(work, 'test'), { recursive: true });
  mkdirSync(path.join(work, 'docs'), { recursive: true });
  writeFileSync(path.join(work, 'package.json'), JSON.stringify({ name: 'export', private: true, type: 'module', scripts: { test: 'node --test test/cell.test.ts' } }));
  writeFileSync(path.join(work, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"\n');
  writeFileSync(path.join(work, 'src/cell.ts'), 'export function cell(v: string): string { return /[",\\n]/.test(v) ? `"${v.replace(/"/g, \'""\')}"` : v; }\n');
  writeFileSync(path.join(work, 'test/cell.test.ts'), 'import test from "node:test";\nimport assert from "node:assert/strict";\nimport { cell } from "../src/cell.ts";\ntest("quotes", () => assert.equal(cell("a,b"), "\\"a,b\\""));\n');
  writeFileSync(path.join(work, 'test_calc.py'), 'def test_add():\n    assert 1 + 1 == 2\n');
  writeFileSync(path.join(work, 'docs/usage.md'), 'secret\n');
  writeFileSync(path.join(work, 'README.md'), '# demo\n');
  chmodSync(path.join(work, 'docs/usage.md'), 0o644);
  const claudeHome = path.join(root, 'claude');
  mkdirSync(claudeHome);
  const ci = process.argv.indexOf('--commit');
  const fw = frameworkAt(ci > 0 ? process.argv[ci + 1] : DEFAULT_COMMIT);
  const evalDir = path.join(root, 'eval');
  const rt = prepareRuntime({ runtime: { standardsCli: { mode: 'shim' }, hideCommands: ['npx'], unreadable: ['docs/usage.md'], outsideDirs: ['/work-outside'] }, specDir: null, evalDir, projectRoot: '/work', framework: fw });
  // Outside directories are host mounts, as run.mjs makes them.
  const outside = path.join(root, 'outside');
  mkdirSync(outside);
  const docker = (cmd, extra = []) => spawnSync('docker', ['run', '--rm', '-v', `${work}:/mnt/project`, '-v', `${evalDir}:/opt/eval:ro`, '-v', `${claudeHome}:/home/runner/.claude`,
    '-v', `${outside}:/work-outside`, ...rt.mounts, '--add-host', 'github.com:0.0.0.0', ...extra, IMAGE, 'sh', '/opt/eval/entry.sh', '2', 'sh', '-c', cmd], { encoding: 'utf8' });
  try {
    let r = docker('claude --version; node --version; pnpm --version; python3 -m pytest --version; id -u');
    const out = `${r.stdout}${r.stderr}`;
    ok('versions: Claude Code, Node 22, pnpm, pytest', out.includes(CLAUDE) && /v22\./.test(out) && out.includes(PNPM) && /pytest/.test(out), out.replace(/\n/g, ' | ').slice(0, 200));
    ok('runs as uid 1001, not root', /\n1001\s*$/.test(r.stdout), r.stdout.trim().split('\n').at(-1));
    r = docker('echo hi > /work/written.txt && touch /home/runner/.claude/probe && cat /work/written.txt');
    ok('project mount and ~/.claude are writable by the runner', r.status === 0 && existsSync(path.join(work, 'written.txt')) && existsSync(path.join(claudeHome, 'probe')), r.stderr.trim());
    r = docker('pnpm install --offline --reporter=silent && pnpm --filter export test 2>&1 | grep -E "^. (pass|fail) "');
    ok('pnpm offline install and TypeScript tests by type stripping', r.status === 0 && /pass 1/.test(r.stdout) && /fail 0/.test(r.stdout), `${r.stdout}${r.stderr}`.trim().slice(-200));
    ok('the run\'s changes are copied back to the host (the lockfile pnpm wrote)', existsSync(path.join(work, 'pnpm-lock.yaml')));
    r = docker('ls /work/README.MD 2>/dev/null && echo insensitive || echo sensitive');
    ok('the role works on a case-sensitive Linux filesystem', /sensitive/.test(r.stdout) && !/insensitive/.test(r.stdout), r.stdout.trim());
    r = docker('python3 -m pytest -q test_calc.py 2>&1 | tail -1; ls -a | grep -c pycache || true');
    ok('pytest runs and leaves no cache', r.status === 0 && /1 passed/.test(r.stdout) && !existsSync(path.join(work, '.pytest_cache')), r.stdout.trim());
    // This runtime has an unreadable file, so these runs start as root and entry.sh drops to the runner.
    r = docker('id -u; chmod u+r docs/usage.md 2>&1; cat docs/usage.md', rt.user);
    ok('an unreadable file cannot be read during the run, even after chmod (root-owned, mode 000); the role runs as 1001',
      r.status !== 0 && /Permission denied/i.test(r.stderr) && /^1001$/m.test(r.stdout) && !/secret/.test(r.stdout), `${r.stdout}${r.stderr}`.trim().replace(/\n/g, ' | '));
    ok('and its mode is restored after the run', (statSync(path.join(work, 'docs/usage.md')).mode & 0o777) === 0o644);
    r = docker('echo hi > /work/as-runner.txt && stat -c %u /work/as-runner.txt && touch /home/runner/.claude/probe2', rt.user);
    ok('started as root, the role still writes the project and ~/.claude as the runner', r.status === 0 && /^1001$/m.test(r.stdout) && existsSync(path.join(work, 'as-runner.txt')) && existsSync(path.join(claudeHome, 'probe2')), `${r.stdout}${r.stderr}`.trim());
    r = docker('command -v npx || echo "npx hidden"; command -v node; command -v claude; command -v git');
    ok('hidden commands are off PATH; node, claude, git stay', /npx hidden/.test(r.stdout) && /node/.test(r.stdout) && /claude/.test(r.stdout) && /git/.test(r.stdout), r.stdout.replace(/\n/g, ' '));
    r = docker('standards --version || standards --help | head -3');
    ok('standards shim runs the pinned framework CLI', r.status === 0 && /\d+\.\d+\.\d+|standards/i.test(r.stdout), `${r.stdout}${r.stderr}`.trim().slice(0, 160));
    r = docker('node -e "fetch(\'https://github.com\').then(()=>console.log(\'reached\'),e=>console.log(\'blocked\',e.cause?.code??e.message))"');
    ok('GitHub is unreachable (--add-host 0.0.0.0)', /blocked/.test(r.stdout) && !/reached/.test(r.stdout), r.stdout.trim());
    r = docker('mkdir -p /work-outside/x && echo ok');
    ok('outside directories are writable', r.status === 0 && existsSync(path.join(outside, 'x')), r.stderr.trim());

    // The bind mount itself (why entry.sh copies the project in): measured, not assumed.
    const mnt = path.join(root, 'mnt');
    mkdirSync(mnt);
    writeFileSync(path.join(mnt, 'secret.txt'), 'x\n');
    writeFileSync(path.join(mnt, 'Readme.md'), '# x\n');
    r = spawnSync('docker', ['run', '--rm', '-v', `${mnt}:/m`, IMAGE, 'sh', '-c', 'chmod 000 /m/secret.txt; cat /m/secret.txt >/dev/null 2>&1 && echo MODE_IGNORED || echo MODE_ENFORCED; test -e /m/README.MD && echo CASE_INSENSITIVE || echo CASE_SENSITIVE'], { encoding: 'utf8' });
    chmodSync(path.join(mnt, 'secret.txt'), 0o644);
    measured.push(`bind mount: ${r.stdout.trim().replace(/\n/g, ', ')}`);

    // A non-default project path, a spec-provided stub CLI, and an extra blocked host.
    const specDir = path.join(root, 'spec');
    mkdirSync(path.join(specDir, 'runtime'), { recursive: true });
    writeFileSync(path.join(specDir, 'runtime/standards'), '#!/bin/sh\necho "stub standards $*"\nexit 3\n');
    const evalDir2 = path.join(root, 'eval2');
    prepareRuntime({ runtime: { projectPath: '/work/bootstrap-demo', standardsCli: { mode: 'stub', script: 'runtime/standards' } }, specDir, evalDir: evalDir2, projectRoot: '/work/bootstrap-demo', framework: fw });
    r = spawnSync('docker', ['run', '--rm', '-v', `${work}:/mnt/project`, '-v', `${evalDir2}:/opt/eval:ro`, '--add-host', 'api.prod.example.com:0.0.0.0', IMAGE, 'sh', '/opt/eval/entry.sh', '2', 'sh', '-c',
      'pwd; test -f README.md && echo HAS_PROJECT; standards --yes; echo "stub exit $?"; getent hosts api.prod.example.com; echo "uid $(id -u)"'], { encoding: 'utf8' });
    ok('a non-default projectPath gets the project, a stub CLI runs, a runtime blocked host resolves to 0.0.0.0; without unreadable files the run never starts as root',
      /^\/work\/bootstrap-demo$/m.test(r.stdout) && /HAS_PROJECT/.test(r.stdout) && /stub standards --yes/.test(r.stdout) && /stub exit 3/.test(r.stdout) && /^0\.0\.0\.0\s+api\.prod\.example\.com/m.test(r.stdout) && /^uid 1001$/m.test(r.stdout), r.stdout.replace(/\n/g, ' | ').slice(0, 240));
  } finally {
    try { chmodSync(path.join(work, 'docs/usage.md'), 0o644); } catch { /* gone */ }
    rmSync(root, { recursive: true, force: true });
  }
  const failed = results.filter((x) => !x.pass).length;
  for (const m of measured) console.log(`measured: ${m}`);
  console.log(failed ? `\nimage check: ${failed} failure(s)` : '\nimage check: all passed');
  process.exit(failed ? 1 : 0);
}

// The browser variant (Dockerfile.browser), for cases whose runtime block says
// "image": "browser". Built on the runner image; its versions go into
// image.json under `browser`. check-browser launches headless Chromium as the
// runner from a project directory, through an ESM import, with no network.
const BROWSER = BROWSER_IMAGE;
const PLAYWRIGHT = PLAYWRIGHT_VERSION;
function buildBrowser() {
  execFileSync('docker', ['build', '-t', BROWSER, '-f', path.join(HERE, 'Dockerfile.browser'), '--build-arg', `RUNNER_IMAGE=${IMAGE}`, '--build-arg', `PLAYWRIGHT_VERSION=${PLAYWRIGHT}`, HERE], { stdio: 'inherit' });
  const info = JSON.parse(execFileSync('cat', [path.join(HERE, 'image.json')], { encoding: 'utf8' }));
  info.browser = { image: BROWSER, imageId: sh('docker', ['image', 'inspect', '--format', '{{.Id}}', BROWSER]), base: info.imageId,
    playwright: sh('docker', ['run', '--rm', BROWSER, 'playwright', '--version']), builtAt: new Date().toISOString() };
  writeFileSync(path.join(HERE, 'image.json'), `${JSON.stringify(info, null, 2)}\n`);
  console.log(JSON.stringify(info.browser, null, 2));
}
function checkBrowser() {
  const js = "import('playwright').then(async ({ chromium }) => { const b = await chromium.launch(); const p = await b.newPage(); await p.setContent('<button id=x>Download</button>'); await p.focus('#x'); console.log('focused', await p.evaluate(() => document.activeElement.id), 'uid', process.getuid()); await b.close(); })";
  const out = sh('docker', ['run', '--rm', '--network', 'none', '-w', '/work', BROWSER, 'node', '--input-type=module', '-e', js]);
  const ok = /focused x uid 1001/.test(out);
  console.log(`${ok ? 'ok  ' : 'FAIL'} headless Chromium runs as the runner from a project directory with no network — ${out}`);
  process.exit(ok ? 0 : 1);
}

const [cmd] = process.argv.slice(2);
if (cmd === 'build') build();
else if (cmd === 'check') check();
else if (cmd === 'build-browser') buildBrowser();
else if (cmd === 'check-browser') checkBrowser();
else throw new Error('usage: image.mjs build|check|build-browser|check-browser');
