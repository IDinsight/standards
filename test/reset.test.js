import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, readlink, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { runCli } from '../lib/cli.js';
import { installProject } from '../lib/install.js';
import { resetProject } from '../lib/reset.js';
import { uninstallProject } from '../lib/uninstaller.js';

async function fixture(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'standards-reset-test-'));
  try { await run(root); } finally { await rm(root, { recursive: true, force: true }); }
}
const read = (root, relative) => readFile(path.join(root, relative), 'utf8');
const write = (root, relative, value) => writeFile(path.join(root, relative), value);
const template = (mode, name) => readFile(new URL(`../templates/${mode}/.standards/${name}`, import.meta.url), 'utf8');

async function snapshot(root, prefix = '') {
  const files = {};
  for (const entry of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isSymbolicLink()) files[relative] = { link: await readlink(path.join(root, relative)) };
    else if (entry.isDirectory()) {
      files[relative] = null;
      Object.assign(files, await snapshot(root, relative));
    } else files[relative] = (await readFile(path.join(root, relative))).toString('base64');
  }
  return files;
}

// An installed project partway through a cycle, with context, records, and a user style.
async function projectWithWork(root) {
  await installProject({ projectRoot: root });
  const state = await read(root, '.standards/STATE.md');
  await write(root, '.standards/STATE.md', state.replace('`Id`: `UNSET`', '`Id`: `old-work-20260901T120000Z-1a2b3c4d`'));
  await write(root, '.standards/CONTEXT.md', '# Project Context\n');
  await mkdir(path.join(root, '.standards/docs/scope'), { recursive: true });
  await write(root, '.standards/docs/scope/old-work-20260901T120000Z-1a2b3c4d.md', 'Scope record\n');
  await mkdir(path.join(root, '.standards/user-styles/developer'), { recursive: true });
  await write(root, '.standards/user-styles/developer/alex.md', '# Alex\n');
  await write(root, 'app.py', 'print("hello")\n');
}

test('reset deletes workflow data, keeps the installation and user styles, and chooses the mode again', () => fixture(async (root) => {
  await projectWithWork(root);
  const kept = ['PROTOCOL.md', 'VERSION.json', 'INSTALLATION.json', 'bin/check.mjs', 'user-styles/developer/alex.md'];
  const before = Object.fromEntries(await Promise.all(kept.map(async (name) => [name, await read(root, `.standards/${name}`)])));
  const outside = await snapshot(root, '.claude');
  const result = await resetProject({ projectRoot: root });
  assert.equal(result.mode, 'BROWNFIELD');
  assert.deepEqual(result.paths, [
    { action: 'remove', path: '.standards/docs' },
    { action: 'remove', path: '.standards/CONTEXT.md' },
    { action: 'write', path: '.standards/MODE.md' },
    { action: 'write', path: '.standards/STATE.md' },
  ]);
  assert.ok(result.warnings.includes('Deletes 1 cycle record in .standards/docs/ (scope, design, development, '
    + 'verification, review, documentation, and synchronization records).'), result.warnings.join('\n'));
  assert.equal(await read(root, '.standards/STATE.md'), await template('brownfield', 'STATE.md'));
  assert.equal(await read(root, '.standards/MODE.md'), await template('brownfield', 'MODE.md'));
  for (const name of kept) assert.equal(await read(root, `.standards/${name}`), before[name]);
  assert.equal((await readdir(path.join(root, '.standards'))).some((name) => ['docs', 'CONTEXT.md'].includes(name)), false);
  assert.deepEqual(await snapshot(root, '.claude'), outside);
  assert.equal(await read(root, 'app.py'), 'print("hello")\n');
  // A fresh workflow has nothing left to reset.
  assert.deepEqual((await resetProject({ projectRoot: root })).paths, []);
}));

test('reset takes an explicit mode and a dry run changes nothing', () => fixture(async (root) => {
  await projectWithWork(root);
  const before = await snapshot(root);
  const preview = await resetProject({ projectRoot: root, mode: 'GREENFIELD', dryRun: true });
  assert.equal(preview.mode, 'GREENFIELD');
  assert.equal(preview.changed, 0);
  assert.deepEqual(await snapshot(root), before);
  await resetProject({ projectRoot: root, mode: 'GREENFIELD', expectedPlan: preview });
  assert.equal(await read(root, '.standards/STATE.md'), await template('greenfield', 'STATE.md'));
  assert.match(await read(root, '.standards/MODE.md'), /`GREENFIELD`/);
}));

test('reset repairs broken workflow files but needs an owned runtime of the same version', () => fixture(async (root) => {
  await assert.rejects(resetProject({ projectRoot: root }), /No STANDARDS installation found/);
  await mkdir(path.join(root, '.standards'));
  await write(root, '.standards/PROTOCOL.md', '# Unrelated\n');
  await assert.rejects(resetProject({ projectRoot: root }), /not framework-owned/);
  await rm(path.join(root, '.standards'), { recursive: true });

  await installProject({ projectRoot: root });
  await write(root, '.standards/STATE.md', '<<<<<<< ours\nbroken\n');
  await rm(path.join(root, '.standards/MODE.md'));
  await resetProject({ projectRoot: root });
  assert.equal(await read(root, '.standards/STATE.md'), await template('greenfield', 'STATE.md'));

  await write(root, '.standards/VERSION.json', JSON.stringify({ framework: 'S.T.A.N.D.A.R.D.S.', version: '0.0.1' }));
  await write(root, '.standards/CONTEXT.md', 'Keep until the right CLI resets it\n');
  await assert.rejects(resetProject({ projectRoot: root }), /STANDARDS 0\.0\.1 is installed, but this CLI is .*@idinsight\/standards@0\.0\.1 reset/);
  assert.equal(await read(root, '.standards/CONTEXT.md'), 'Keep until the right CLI resets it\n');
}));

test('reset refuses a symlinked record folder and a changed preview before changing anything', () => fixture(async (root) => {
  await projectWithWork(root);
  const preview = await resetProject({ projectRoot: root, dryRun: true });
  await write(root, '.standards/docs/scope/another.md', 'Written after the preview\n');
  await assert.rejects(resetProject({ projectRoot: root, expectedPlan: preview }), /Project changed after the reset preview/);
  const outside = await mkdtemp(path.join(os.tmpdir(), 'standards-reset-outside-'));
  try {
    await write(outside, 'kept.md', 'Outside the project\n');
    await symlink(outside, path.join(root, '.standards/docs/linked'));
    const before = await snapshot(root);
    await assert.rejects(resetProject({ projectRoot: root }), /symbolic link/);
    assert.deepEqual(await snapshot(root), before);
    assert.equal(await read(outside, 'kept.md'), 'Outside the project\n');
  } finally {
    await rm(outside, { recursive: true, force: true });
  }
}));

test('an interrupted reset blocks install, reset, and uninstall', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  await mkdir(path.join(root, '.standards-reset-interrupted'));
  for (const run of [() => installProject({ projectRoot: root }), () => resetProject({ projectRoot: root }),
    () => uninstallProject({ projectRoot: root })]) {
    await assert.rejects(run(), /Interrupted STANDARDS installer transaction/);
  }
}));

test('CLI reset previews with --dry-run and resets with --yes', () => fixture(async (root) => {
  await projectWithWork(root);
  let text = '';
  const stdout = { write(chunk) { text += chunk; } };
  const stderr = { write(chunk) { text += chunk; } };
  assert.equal(await runCli(['reset', '--project', root, '--dry-run'], { cwd: root, stdout, stderr }), 0);
  assert.match(text, /Would reset STANDARDS/);
  assert.match(text, /Remove: \.standards\/docs/);
  assert.match(text, /Warning: Deletes 1 cycle record/);
  assert.equal(await read(root, '.standards/CONTEXT.md'), '# Project Context\n');
  text = '';
  assert.equal(await runCli(['reset', '--project', root, '--yes'], { cwd: root, stdout, stderr }), 0);
  assert.match(text, /Reset STANDARDS/);
  assert.match(text, /Removed: \.standards\/CONTEXT\.md/);
  assert.equal((await readdir(path.join(root, '.standards'))).includes('CONTEXT.md'), false);
  text = '';
  assert.equal(await runCli(['reset', '--project', root, '--yes'], { cwd: root, stdout, stderr }), 0);
  assert.match(text, /already a fresh brownfield workflow; nothing to reset/);
}));
