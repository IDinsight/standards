import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, readlink, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { runCli } from '../lib/cli.js';
import { installProject } from '../lib/install.js';
import { applyOperations } from '../lib/install-files.js';
import { MARKER, blockRange } from '../lib/ownership.js';
import { uninstallProject } from '../lib/uninstaller.js';

async function fixture(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'standards-uninstaller-test-'));
  try { await run(root); } finally { await rm(root, { recursive: true, force: true }); }
}
const read = (root, relative) => readFile(path.join(root, relative), 'utf8');
const write = (root, relative, value) => writeFile(path.join(root, relative), value);

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

test('uninstall removes both clients and saved history, keeps project work, and permits fresh installation', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  await write(root, '.standards/STATE.md', 'Active unfinished work\n');
  await write(root, '.standards/CONTEXT.md', 'Saved audit\n');
  await write(root, '.standards/CYCLE_IDS.md', 'Reserved old cycle\n');
  await mkdir(path.join(root, 'docs'));
  await write(root, 'docs/scope.md', 'Keep role output\n');
  await write(root, 'app.js', 'Keep implementation\n');
  const result = await uninstallProject({ projectRoot: root });
  assert.deepEqual(result.clients, ['codex', 'claude']);
  assert.equal(result.changed, result.paths.length);
  for (const name of ['.standards', '.agents', '.claude', 'AGENTS.md', 'CLAUDE.md']) {
    assert.equal((await readdir(root)).includes(name), false);
  }
  assert.equal(await read(root, 'docs/scope.md'), 'Keep role output\n');
  assert.equal(await read(root, 'app.js'), 'Keep implementation\n');
  assert.equal((await uninstallProject({ projectRoot: root })).changed, 0);
  assert.equal((await installProject({ projectRoot: root })).action, 'Installed');
}));

test('uninstall preserves exact text outside managed blocks and an existing Claude import', () => fixture(async (root) => {
  await write(root, 'AGENTS.md', '# Project\r\nKeep me\r\n');
  await write(root, 'CLAUDE.md', '# Personal guidance\r\n@AGENTS.md\r\n');
  await installProject({ projectRoot: root });
  await write(root, 'AGENTS.md', (await read(root, 'AGENTS.md')) + '\r\nMore project guidance\r\n');
  const agents = await read(root, 'AGENTS.md');
  const range = blockRange(agents, 'AGENTS.md');
  const expected = agents.slice(0, range.start) + agents.slice(range.end);
  await uninstallProject({ projectRoot: root });
  assert.equal(await read(root, 'AGENTS.md'), expected);
  assert.equal(await read(root, 'CLAUDE.md'), '# Personal guidance\r\n@AGENTS.md\r\n');
}));

test('uninstall keeps additions to initially generated instruction files', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  for (const relative of ['AGENTS.md', 'CLAUDE.md']) {
    await write(root, relative, (await read(root, relative)) + '\nKeep this instruction.\n');
  }
  await uninstallProject({ projectRoot: root });
  for (const relative of ['AGENTS.md', 'CLAUDE.md']) {
    assert.match(await read(root, relative), /Keep this instruction/);
    assert.doesNotMatch(await read(root, relative), /standards:start/);
  }
}));

test('only matching recorded settings are removed; other settings and skills survive', () => fixture(async (root) => {
  await mkdir(path.join(root, '.claude/skills/personal'), { recursive: true });
  await write(root, '.claude/skills/personal/SKILL.md', '# My skill\n');
  await symlink('personal', path.join(root, '.claude/skills/personal-link'));
  await write(root, '.claude/settings.json', JSON.stringify({
    theme: 'dark', skillOverrides: { scoper: 'user-invocable-only', personal: 'auto' },
  }));
  await installProject({ projectRoot: root });
  const settings = JSON.parse(await read(root, '.claude/settings.json'));
  settings.skillOverrides.developer = 'auto';
  delete settings.skillOverrides.tester;
  await write(root, '.claude/settings.json', JSON.stringify(settings));
  const result = await uninstallProject({ projectRoot: root });
  assert.deepEqual(JSON.parse(await read(root, '.claude/settings.json')), {
    theme: 'dark', skillOverrides: { scoper: 'user-invocable-only', personal: 'auto', developer: 'auto' },
  });
  assert.deepEqual(result.warnings, ['Preserved changed setting: .claude/settings.json skillOverrides.developer']);
  assert.equal(await read(root, '.claude/skills/personal/SKILL.md'), '# My skill\n');
  assert.equal(await readlink(path.join(root, '.claude/skills/personal-link')), 'personal');
  assert.equal((await readdir(root)).includes('.claude'), true);
  assert.equal((await readdir(root)).includes('.agents'), false);
}));

test('legacy installation records leave unrecorded settings and parent directories', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  const record = JSON.parse(await read(root, '.standards/INSTALLATION.json'));
  delete record.createdPaths;
  await write(root, '.standards/INSTALLATION.json', JSON.stringify(record));
  const result = await uninstallProject({ projectRoot: root });
  assert.ok(result.paths.some((entry) => entry.path === '.claude/settings.json' && entry.action === 'update'));
  assert.equal(result.paths.some((entry) => entry.path === '.claude' && entry.action === 'remove'), false);
  assert.deepEqual(JSON.parse(await read(root, '.claude/settings.json')), {
    $schema: 'https://json.schemastore.org/claude-code-settings.json', skillOverrides: {},
  });
  assert.deepEqual(await readdir(path.join(root, '.claude/skills')), []);
  assert.deepEqual(await readdir(path.join(root, '.agents/skills')), []);
}));

test('existing parent directories stay, even when the installer created their children', () => fixture(async (root) => {
  await mkdir(path.join(root, '.claude'));
  await write(root, '.claude/notes.md', 'Keep project notes');
  await mkdir(path.join(root, '.agents'));
  await installProject({ projectRoot: root });
  const record = JSON.parse(await read(root, '.standards/INSTALLATION.json'));
  assert.deepEqual(record.createdPaths, [
    '.agents/skills', '.claude/skills', '.claude/settings.json',
  ]);
  await uninstallProject({ projectRoot: root });
  assert.deepEqual(await readdir(path.join(root, '.claude')), ['notes.md']);
  assert.deepEqual(await readdir(path.join(root, '.agents')), []);
}));

test('generated settings and client directories remain when a user adds content', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  const settings = JSON.parse(await read(root, '.claude/settings.json'));
  settings.theme = 'dark';
  await write(root, '.claude/settings.json', JSON.stringify(settings));
  await write(root, '.agents/skills/personal.txt', 'Keep my skill');
  const result = await uninstallProject({ projectRoot: root });
  assert.ok(result.paths.some((entry) => entry.path === '.claude/settings.json' && entry.action === 'update'));
  assert.equal(result.paths.some((entry) => entry.path === '.claude' && entry.action === 'remove'), false);
  assert.deepEqual(JSON.parse(await read(root, '.claude/settings.json')), {
    $schema: 'https://json.schemastore.org/claude-code-settings.json',
    skillOverrides: {}, theme: 'dark',
  });
  assert.equal(await read(root, '.agents/skills/personal.txt'), 'Keep my skill');
}));

test('adding a client later records only paths created at that time', () => fixture(async (root) => {
  await installProject({ projectRoot: root, clients: ['codex'] });
  assert.deepEqual(JSON.parse(await read(root, '.standards/INSTALLATION.json')).createdPaths,
    ['.agents', '.agents/skills']);
  await mkdir(path.join(root, '.claude'));
  await installProject({ projectRoot: root, clients: ['claude'] });
  assert.deepEqual(JSON.parse(await read(root, '.standards/INSTALLATION.json')).createdPaths,
    ['.agents', '.agents/skills', '.claude/skills', '.claude/settings.json']);
  await uninstallProject({ projectRoot: root });
  assert.equal((await readdir(root)).includes('.agents'), false);
  assert.deepEqual(await readdir(path.join(root, '.claude')), []);
}));

for (const client of ['codex', 'claude']) {
  test('uninstall handles a ' + client + '-only installation', () => fixture(async (root) => {
    await installProject({ projectRoot: root, clients: [client] });
    assert.deepEqual((await uninstallProject({ projectRoot: root })).clients, [client]);
    assert.equal((await readdir(root)).includes('.standards'), false);
    assert.equal((await readdir(root)).includes(client === 'codex' ? '.agents' : '.claude'), false);
  }));
}

test('dry-run describes the actual plan without changing any files or creating transaction folders', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  const before = await snapshot(root);
  const preview = await uninstallProject({ projectRoot: root, dryRun: true });
  assert.equal(preview.changed, 0);
  assert.ok(preview.paths.some((entry) => entry.path === '.standards' && entry.action === 'remove'));
  for (const relative of ['.claude/settings.json', '.claude/skills', '.claude', '.agents']) {
    assert.ok(preview.paths.some((entry) => entry.path === relative && entry.action === 'remove'));
  }
  assert.deepEqual(await snapshot(root), before);
  const actual = await uninstallProject({ projectRoot: root });
  assert.deepEqual(actual.paths, preview.paths);
}));

const failures = [
  ['missing ownership record', (root) => rm(path.join(root, '.standards/INSTALLATION.json')), /cannot determine settings ownership/],
  ['invalid ownership record', (root) => write(root, '.standards/INSTALLATION.json', '{}'), /Invalid .*INSTALLATION/],
  ['invalid record JSON', (root) => write(root, '.standards/INSTALLATION.json', '{'), /Invalid JSON/],
  ['unmarked runtime', (root) => write(root, '.standards/PROTOCOL.md', '# Not ours'), /not framework-owned/],
  ['unmarked role', (root) => write(root, '.agents/skills/scoper/SKILL.md', '# Not ours'), /Skill collision/],
  ['malformed block', (root) => write(root, 'CLAUDE.md', '<!-- standards:start -->'), /Invalid STANDARDS block/],
  ['invalid settings JSON', (root) => write(root, '.claude/settings.json', '{'), /Invalid JSON/],
  ['invalid overrides', (root) => write(root, '.claude/settings.json', '{"skillOverrides":[]}'), /Invalid skillOverrides/],
  ['symlink inside runtime', (root) => symlink('../AGENTS.md', path.join(root, '.standards/link')), /symbolic link/],
  ['symlink inside owned skill', (root) => symlink('../../../AGENTS.md', path.join(root, '.agents/skills/scoper/link')), /symbolic link/],
  ['symlinked instruction file', async (root) => {
    await rm(path.join(root, 'AGENTS.md'));
    await symlink('CLAUDE.md', path.join(root, 'AGENTS.md'));
  }, /symbolic link/],
  ['unknown ownership fields', async (root) => {
    const record = JSON.parse(await read(root, '.standards/INSTALLATION.json'));
    record.futureMutations = [];
    await write(root, '.standards/INSTALLATION.json', JSON.stringify(record));
  }, /Unsupported ownership records/],
  ['invalid created path', async (root) => {
    const record = JSON.parse(await read(root, '.standards/INSTALLATION.json'));
    record.createdPaths.push('docs');
    await write(root, '.standards/INSTALLATION.json', JSON.stringify(record));
  }, /Invalid createdPaths/],
  ['unknown settings ownership', async (root) => {
    const record = JSON.parse(await read(root, '.standards/INSTALLATION.json'));
    record.managedClientSettings['.other/settings.json'] = {};
    await write(root, '.standards/INSTALLATION.json', JSON.stringify(record));
  }, /Unsupported ownership records/],
];

for (const [name, prepare, error] of failures) {
  test('uninstall fails before any mutation: ' + name, () => fixture(async (root) => {
    await installProject({ projectRoot: root });
    await prepare(root);
    const before = await snapshot(root);
    await assert.rejects(uninstallProject({ projectRoot: root }), error);
    assert.deepEqual(await snapshot(root), before);
  }));
}

test('incomplete workflow metadata and missing skills do not block removal with valid ownership', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  for (const name of ['MODE.md', 'STATE.md', 'VERSION.json', 'CYCLE_IDS.md']) {
    await rm(path.join(root, '.standards', name));
  }
  await rm(path.join(root, '.agents/skills/scoper'), { recursive: true });
  await mkdir(path.join(root, '.agents/skills/retired-role'));
  await write(root, '.agents/skills/retired-role/SKILL.md', MARKER + '\n# Old role\n');
  const result = await uninstallProject({ projectRoot: root });
  assert.ok(result.paths.some((entry) => entry.path === '.agents/skills/retired-role'));
  assert.equal((await readdir(root)).includes('.agents'), false);
}));

test('no installation is a no-op, but orphaned blocks or marked skills need ownership recovery', () => fixture(async (root) => {
  assert.equal((await uninstallProject({ projectRoot: root })).changed, 0);
  await write(root, 'AGENTS.md', '<!-- standards:start -->\nOld block\n<!-- standards:end -->');
  let before = await snapshot(root);
  await assert.rejects(uninstallProject({ projectRoot: root }), /Incomplete runtime/);
  assert.deepEqual(await snapshot(root), before);
  await rm(path.join(root, 'AGENTS.md'));
  await mkdir(path.join(root, '.agents/skills/scoper'), { recursive: true });
  await write(root, '.agents/skills/scoper/SKILL.md', MARKER);
  before = await snapshot(root);
  await assert.rejects(uninstallProject({ projectRoot: root }), /Incomplete runtime/);
  assert.deepEqual(await snapshot(root), before);
}));

test('missing or independently removed settings are not reconstructed during uninstall', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  await rm(path.join(root, '.claude/settings.json'));
  await uninstallProject({ projectRoot: root });
  assert.equal((await readdir(root)).includes('.claude'), false);
}));

test('both commands refuse interrupted install and uninstall transactions', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  for (const prefix of ['.standards-install-', '.standards-uninstall-']) {
    const scratch = path.join(root, prefix + 'interrupted');
    await mkdir(scratch);
    await writeFile(path.join(scratch, 'backup-0'), 'Recovery data');
    const before = await snapshot(root);
    await assert.rejects(uninstallProject({ projectRoot: root }), /Interrupted STANDARDS/);
    await assert.rejects(installProject({ projectRoot: root }), /Interrupted STANDARDS/);
    assert.deepEqual(await snapshot(root), before);
    await rm(scratch, { recursive: true });
  }
}));

test('transaction rolls back removed directories and shared-file edits when a later operation fails', () => fixture(async (root) => {
  await mkdir(path.join(root, 'owned/nested'), { recursive: true });
  await write(root, 'owned/nested/context.md', 'Saved state');
  await write(root, 'AGENTS.md', 'Original instructions');
  await write(root, 'blocker', 'File blocking parent');
  const before = await snapshot(root);
  await assert.rejects(applyOperations(root, [
    { kind: 'file', relative: 'AGENTS.md', contents: 'Updated instructions' },
    { kind: 'remove', relative: 'owned' },
    { kind: 'file', relative: 'blocker/child', contents: 'Fail here' },
  ], { scratchPrefix: '.standards-uninstall-' }), /parent is not a normal directory/);
  assert.deepEqual(await snapshot(root), before);
}));

test('CLI previews, uninstalls, and reports a repeated uninstall from the current directory', () => fixture(async (root) => {
  await installProject({ projectRoot: root });
  let output = '';
  const streams = {
    cwd: root,
    stdout: { write(chunk) { output += chunk; } },
    stderr: { write(chunk) { throw new Error(chunk); } },
  };
  const before = await snapshot(root);
  assert.equal(await runCli(['uninstall', '--dry-run'], streams), 0);
  assert.match(output, /Would uninstall STANDARDS/);
  assert.match(output, /Remove: .standards/);
  assert.match(output, /no files changed/);
  assert.deepEqual(await snapshot(root), before);
  output = '';
  assert.equal(await runCli(['uninstall', '--project', root], streams), 0);
  assert.match(output, /Uninstalled STANDARDS/);
  assert.match(output, /Removed: .standards/);
  assert.match(output, /Removed: .claude\/settings.json/);
  assert.match(output, /Removed: .claude\n/);
  output = '';
  assert.equal(await runCli(['uninstall'], streams), 0);
  assert.match(output, /No STANDARDS installation found/);
}));
