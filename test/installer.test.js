import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { installProject } from '../lib/install.js';
import { applyOperations } from '../lib/install-files.js';
import { checkUpgrade } from '../lib/installer.js';
import { runCli } from '../lib/cli.js';

const packageVersion = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).version;
const incompatibleVersion = `${Number(packageVersion.split('.')[0]) + 1}.0.0`;

async function fixture(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'standards-installer-test-'));
  try { await run(root); } finally { await rm(root, { recursive: true, force: true }); }
}

const read = (root, relative) => readFile(path.join(root, relative), 'utf8');
const write = (root, relative, value) => writeFile(path.join(root, relative), value);

test('first install creates both client skills and a greenfield runtime', () => fixture(async (root) => {
  const result = await installProject({ projectRoot: root });
  assert.equal(result.action, 'Installed');
  assert.equal(result.mode, 'GREENFIELD');
  assert.deepEqual(result.clients, ['codex', 'claude']);
  assert.match(await read(root, '.standards/PROTOCOL.md'), /standards:framework-owned/);
  assert.equal(JSON.parse(await read(root, '.standards/VERSION.json')).version, packageVersion);
  assert.match(await read(root, '.standards/MODE.md'), /`GREENFIELD`/);
  assert.match(await read(root, '.standards/STATE.md'), /`WorkflowState`: `SCOPING`/);
  assert.match(await read(root, '.agents/skills/scoper/agents/openai.yaml'), /allow_implicit_invocation: false/);
  assert.match(await read(root, '.claude/skills/scoper/SKILL.md'), /standards:framework-owned/);
  assert.match(await read(root, 'CLAUDE.md'), /@AGENTS.md/);
  const manifest = JSON.parse(await read(root, '.standards/INSTALLATION.json'));
  const settings = JSON.parse(await read(root, '.claude/settings.json'));
  assert.deepEqual(manifest.createdPaths, [
    '.agents', '.agents/skills', '.claude', '.claude/skills', '.claude/settings.json', '.codex', '.codex/hooks.json',
  ]);
  assert.deepEqual(manifest.hooks, ['.codex/hooks.json', '.claude/settings.json']);
  assert.match(await read(root, '.codex/hooks.json'), /\.standards\/bin\/hook\.mjs\\" stop/);
  assert.match(JSON.stringify(settings.hooks), /\.standards\/bin\/hook\.mjs/);
  assert.equal(Object.keys(manifest.managedClientSettings['.claude/settings.json'].skillOverrides).length, 9);
  assert.equal(Object.keys(settings.skillOverrides).length, 9);
  assert.deepEqual((await readdir(root)).filter((name) => name.startsWith('.standards-install-')), []);
}));

test('CLI installs into the requested project with both clients by default', () => fixture(async (root) => {
  let output = '';
  const code = await runCli(['install', '--project', root], {
    cwd: path.dirname(root),
    stdout: { write(chunk) { output += chunk; } },
    stderr: { write(chunk) { throw new Error(chunk); } },
  });
  assert.equal(code, 0);
  assert.match(output, /clients: codex, claude/);
  assert.match(await read(root, '.agents/skills/scoper/SKILL.md'), /standards:framework-owned/);
  assert.match(await read(root, '.claude/skills/scoper/SKILL.md'), /standards:framework-owned/);
}));

test('brownfield install preserves project instructions and compatible unowned settings', () => fixture(async (root) => {
  await mkdir(path.join(root, 'src'));
  await write(root, 'src/app.js', 'export const app = true;\n');
  await write(root, 'AGENTS.md', '# Existing project guidance\nKeep this line.\n');
  await write(root, 'CLAUDE.md', '# Claude guidance\n@AGENTS.md\n');
  await mkdir(path.join(root, '.claude'));
  await write(root, '.claude/settings.json', JSON.stringify({ theme: 'dark', skillOverrides: {
    scoper: 'user-invocable-only',
  } }, null, 2));
  const result = await installProject({ projectRoot: root });
  assert.equal(result.mode, 'BROWNFIELD');
  assert.match(await read(root, 'AGENTS.md'), /^# Existing project guidance\nKeep this line\./);
  assert.equal(await read(root, 'CLAUDE.md'), '# Claude guidance\n@AGENTS.md\n');
  const settings = JSON.parse(await read(root, '.claude/settings.json'));
  assert.equal(settings.theme, 'dark');
  const owned = JSON.parse(await read(root, '.standards/INSTALLATION.json'))
    .managedClientSettings['.claude/settings.json'].skillOverrides;
  assert.equal(owned.scoper, undefined);
  assert.equal(Object.keys(owned).length, 8);
  assert.deepEqual(JSON.parse(await read(root, '.standards/INSTALLATION.json')).createdPaths,
    ['.agents', '.agents/skills', '.claude/skills', '.codex', '.codex/hooks.json']);
  assert.equal(await read(root, 'src/app.js'), 'export const app = true;\n');
}));

test('a package manifest and lockfile alone do not imply a brownfield implementation', () => fixture(async (root) => {
  await write(root, 'package.json', '{"name":"new-project"}\n');
  await write(root, 'pnpm-lock.yaml', 'lockfileVersion: "9.0"\n');
  const result = await installProject({ projectRoot: root });
  assert.equal(result.mode, 'GREENFIELD');
}));

test('reinstall and upgrade preserve registry, workflow state, and auditor context', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  await write(root, '.standards/CYCLE_IDS.md', (await read(root, '.standards/CYCLE_IDS.md')) + '- saved-cycle-123\n');
  await write(root, '.standards/CONTEXT.md', 'Auditor-owned context\n');
  const state = await read(root, '.standards/STATE.md');
  const unchanged = await installProject({ projectRoot: root });
  assert.equal(unchanged.action, 'Verified');
  assert.equal(unchanged.changed, 0);
  await write(root, '.standards/PROTOCOL.md', (await read(root, '.standards/PROTOCOL.md')) + '\nOld version\n');
  await write(root, '.agents/skills/scoper/SKILL.md', (await read(root, '.agents/skills/scoper/SKILL.md')) + '\nOld version\n');
  const upgraded = await installProject({ projectRoot: root, clients: ['codex'] });
  assert.equal(upgraded.action, 'Updated');
  assert.doesNotMatch(await read(root, '.standards/PROTOCOL.md'), /Old version/);
  assert.doesNotMatch(await read(root, '.agents/skills/scoper/SKILL.md'), /Old version/);
  assert.equal(await read(root, '.standards/STATE.md'), state);
  assert.match(await read(root, '.standards/CYCLE_IDS.md'), /- saved-cycle-123/);
  assert.equal(await read(root, '.standards/CONTEXT.md'), 'Auditor-owned context\n');
}));

test('unmarked runtime and skill collisions leave project files untouched', () => fixture(async (root) => {
  await mkdir(path.join(root, '.standards'));
  await write(root, '.standards/PROTOCOL.md', '# Unrelated protocol\n');
  await assert.rejects(installProject({ projectRoot: root }), /Path collision/);
  assert.equal(await read(root, '.standards/PROTOCOL.md'), '# Unrelated protocol\n');
  assert.equal((await readdir(root)).includes('AGENTS.md'), false);
  await rm(path.join(root, '.standards'), { recursive: true });
  await mkdir(path.join(root, '.agents/skills/scoper'), { recursive: true });
  await write(root, '.agents/skills/scoper/SKILL.md', '# Project-owned skill\n');
  await assert.rejects(installProject({ projectRoot: root }), /Skill collision/);
  assert.equal(await read(root, '.agents/skills/scoper/SKILL.md'), '# Project-owned skill\n');
  assert.equal((await readdir(root)).includes('.standards'), false);
}));

test('an incomplete runtime fails before mutation', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  const agents = await read(root, 'AGENTS.md');
  await rm(path.join(root, '.standards/CYCLE_IDS.md'));
  await assert.rejects(installProject({ projectRoot: root }), /missing \.standards\/CYCLE_IDS\.md/);
  assert.equal(await read(root, 'AGENTS.md'), agents);
}));

test('reinstall restores changed or removed owned settings and hooks and reports them', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  const installed = await read(root, '.claude/settings.json');
  const settings = JSON.parse(installed);
  settings.skillOverrides.scoper = 'auto';
  delete settings.skillOverrides.tester;
  delete settings.hooks;
  settings.theme = 'dark';
  await write(root, '.claude/settings.json', JSON.stringify(settings));
  await rm(path.join(root, '.codex/hooks.json'));
  const result = await installProject({ projectRoot: root });
  assert.deepEqual(result.restored, [
    '.claude/settings.json skillOverrides.scoper (was "auto")',
    '.claude/settings.json skillOverrides.tester (missing)',
    'STANDARDS hooks in .claude/settings.json',
    'STANDARDS hooks in .codex/hooks.json',
  ]);
  const restored = JSON.parse(await read(root, '.claude/settings.json'));
  assert.deepEqual(restored, { ...JSON.parse(installed), theme: 'dark' });
  assert.match(await read(root, '.codex/hooks.json'), /hook\.mjs/);
  assert.deepEqual((await installProject({ projectRoot: root })).restored, []);
}));

test('an unowned conflicting setting still fails before mutation', () => fixture(async (root) => {
  await mkdir(path.join(root, '.claude'));
  await write(root, '.claude/settings.json', JSON.stringify({ skillOverrides: { scoper: 'on' } }));
  await assert.rejects(installProject({ projectRoot: root }), /Conflicting \.claude\/settings\.json skillOverrides\.scoper/);
  assert.equal((await readdir(root)).includes('.standards'), false);
}));

test('adding Claude later records only settings newly created by the installer', () => fixture(async (root) => {
  const initial = await installProject({ projectRoot: root, clients: ['codex'], mode: 'GREENFIELD' });
  assert.deepEqual(initial.clients, ['codex']);
  assert.equal((await readdir(root)).includes('.claude'), false);
  const added = await installProject({ projectRoot: root, clients: ['claude'] });
  assert.deepEqual(added.clients, ['codex', 'claude']);
  const owned = JSON.parse(await read(root, '.standards/INSTALLATION.json'))
    .managedClientSettings['.claude/settings.json'].skillOverrides;
  assert.equal(Object.keys(owned).length, 9);
  await assert.rejects(
    installProject({ projectRoot: root, mode: 'BROWNFIELD' }),
    /installer cannot change it/,
  );
}));

test('transaction restores earlier files if a later operation fails', () => fixture(async (root) => {
  await write(root, 'keep.txt', 'original\n');
  await write(root, 'blocker', 'not a directory\n');
  await assert.rejects(applyOperations(root, [
    { kind: 'file', relative: 'keep.txt', contents: 'replacement\n' },
    { kind: 'file', relative: 'blocker/child.txt', contents: 'new\n' },
  ]), /parent is not a normal directory/);
  assert.equal(await read(root, 'keep.txt'), 'original\n');
  assert.deepEqual((await readdir(root)).filter((name) => name.startsWith('.standards-install-')), []);
}));

test('invalid managed blocks and symlinked destinations fail closed', () => fixture(async (root) => {
  await write(root, 'AGENTS.md', '<!-- standards:start -->\nUnclosed block\n');
  await assert.rejects(installProject({ projectRoot: root }), /Invalid STANDARDS block/);
  assert.equal((await readdir(root)).includes('.standards'), false);
  await rm(path.join(root, 'AGENTS.md'));
  await mkdir(path.join(root, 'elsewhere'));
  const { symlink } = await import('node:fs/promises');
  await symlink(path.join(root, 'elsewhere'), path.join(root, '.claude'));
  await assert.rejects(installProject({ projectRoot: root }), /Refusing symbolic link/);
  assert.equal((await readdir(root)).includes('.standards'), false);
}));

test('interrupted installer backups and malformed state block reinstall', () => fixture(async (root) => {
  await mkdir(path.join(root, '.standards-install-interrupted'));
  await assert.rejects(installProject({ projectRoot: root }), /Interrupted STANDARDS installer transaction/);
  assert.equal((await readdir(root)).includes('.standards'), false);
  await rm(path.join(root, '.standards-install-interrupted'), { recursive: true });
  await installProject({ projectRoot: root });
  const state = await read(root, '.standards/STATE.md');
  await write(root, '.standards/STATE.md', state.replace('`PendingCycleMode`: `UNSET`', '`PendingCycleMode`: `INVALID`'));
  await assert.rejects(installProject({ projectRoot: root }), /Inconsistent cycle or pending fields/);
  assert.match(await read(root, '.standards/STATE.md'), /`PendingCycleMode`: `INVALID`/);
}));

test('an active cycle must remain registered before upgrade', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  const state = await read(root, '.standards/STATE.md');
  await write(root, '.standards/STATE.md', state.replace('`Id`: `UNSET`', '`Id`: `missing-cycle-123`'));
  await assert.rejects(installProject({ projectRoot: root }), /active cycle ID is absent/);
  assert.equal(await read(root, '.standards/STATE.md'), state.replace('`Id`: `UNSET`', '`Id`: `missing-cycle-123`'));
}));

test('compatible releases can upgrade, while downgrades and cross-major changes stop', () => {
  assert.doesNotThrow(() => checkUpgrade('1.2.3', '1.2.3'));
  assert.doesNotThrow(() => checkUpgrade('1.2.3', '1.3.0'));
  assert.doesNotThrow(() => checkUpgrade('1.2.3', '1.2.4'));
  assert.throws(() => checkUpgrade('1.2.3', '1.2.2'), /Downgrade/);
  assert.throws(() => checkUpgrade('1.2.3', '2.0.0'), /Cross-major upgrade/);
  assert.throws(() => checkUpgrade('0.2.0', '1.0.0'), /Cross-major upgrade/);
});

test('missing or incompatible version record blocks writes to an installed runtime', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  const protocol = await read(root, '.standards/PROTOCOL.md');
  await rm(path.join(root, '.standards/VERSION.json'));
  await assert.rejects(installProject({ projectRoot: root }), /missing \.standards\/VERSION\.json/);
  assert.equal(await read(root, '.standards/PROTOCOL.md'), protocol);
  await write(root, '.standards/VERSION.json', JSON.stringify({
    framework: 'S.T.A.N.D.A.R.D.S.', version: incompatibleVersion,
  }));
  await assert.rejects(installProject({ projectRoot: root }), /Cross-major upgrade/);
  assert.equal(await read(root, '.standards/PROTOCOL.md'), protocol);
}));

test('reinstall keeps files a user added inside installed skill folders', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  await write(root, '.claude/skills/developer/user-styles/alex.md', '# Alex\n');
  await write(root, '.claude/skills/developer/template.md', 'Edited\n');
  const result = await installProject({ projectRoot: root });
  assert.deepEqual(result.paths, [{ action: 'update skill', path: '.claude/skills/developer' }]);
  assert.equal(await read(root, '.claude/skills/developer/user-styles/alex.md'), '# Alex\n');
  assert.match(await read(root, '.claude/skills/developer/template.md'), /Developer Artifact Template/);
}));

test('reinstall keeps the installed clients unless another is added', () => fixture(async (root) => {
  await installProject({ projectRoot: root, clients: ['codex'] });
  const reinstall = await installProject({ projectRoot: root });
  assert.deepEqual(reinstall.clients, ['codex']);
  assert.equal(reinstall.changed, 0);
  assert.equal((await readdir(root)).includes('.claude'), false);
  assert.deepEqual((await installProject({ projectRoot: root, clients: ['claude'] })).clients, ['codex', 'claude']);
}));

test('hooks can be left out, kept off on reinstall, added later, and removed again', () => fixture(async (root) => {
  const off = await installProject({ projectRoot: root, hooks: false });
  assert.equal(off.hooks, false);
  assert.equal((await readdir(root)).includes('.codex'), false);
  assert.equal(JSON.parse(await read(root, '.claude/settings.json')).hooks, undefined);
  assert.deepEqual(JSON.parse(await read(root, '.standards/INSTALLATION.json')).hooks, []);
  assert.equal((await installProject({ projectRoot: root })).hooks, false);

  const on = await installProject({ projectRoot: root, hooks: true });
  assert.equal(on.hooks, true);
  assert.deepEqual(on.notices, ['Codex runs new or changed hooks only after you trust them: open Codex in this project and run /hooks.']);
  assert.match(await read(root, '.codex/hooks.json'), /hook\.mjs/);
  assert.equal((await installProject({ projectRoot: root })).hooks, true);

  await installProject({ projectRoot: root, hooks: false });
  assert.doesNotMatch(await read(root, '.codex/hooks.json'), /hook\.mjs/);
  assert.equal(JSON.parse(await read(root, '.claude/settings.json')).hooks, undefined);
}));

test('install and uninstall leave a project\'s own hooks alone', () => fixture(async (root) => {
  const own = { type: 'command', command: 'npm run lint' };
  await mkdir(path.join(root, '.claude'));
  await write(root, '.claude/settings.json', JSON.stringify({ hooks: { Stop: [{ hooks: [own] }] } }));
  await mkdir(path.join(root, '.codex'));
  await write(root, '.codex/config.toml', 'model = "x"\n');
  await write(root, '.codex/hooks.json', JSON.stringify({ hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [own] }] } }));
  await installProject({ projectRoot: root });
  const claude = JSON.parse(await read(root, '.claude/settings.json'));
  assert.deepEqual(claude.hooks.Stop[0], { hooks: [own] });
  assert.equal(claude.hooks.Stop.length, 2);
  const codex = JSON.parse(await read(root, '.codex/hooks.json'));
  assert.deepEqual(codex.hooks.PreToolUse[0], { matcher: 'Bash', hooks: [own] });

  const { uninstallProject } = await import('../lib/uninstaller.js');
  await uninstallProject({ projectRoot: root });
  assert.deepEqual(JSON.parse(await read(root, '.claude/settings.json')).hooks, { Stop: [{ hooks: [own] }] });
  assert.deepEqual(JSON.parse(await read(root, '.codex/hooks.json')), { hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [own] }] } });
  assert.equal(await read(root, '.codex/config.toml'), 'model = "x"\n');
}));

test('the cross-major error explains that uninstall and reinstall is the only route', () => {
  assert.throws(() => checkUpgrade('1.4.0', '2.0.0'), /no migration between major versions[\s\S]*standards uninstall[\s\S]*install again/);
});
