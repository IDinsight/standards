import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { parseArguments, runCli } from '../lib/cli.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const packageVersion = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

function output() {
  let text = '';
  return {
    stream: { write(chunk) { text += chunk; } },
    read() { return text; },
  };
}

test('CLI selects an explicit project and client without confusing npm global scope with project scope', () => {
  assert.deepEqual(
    parseArguments(['install', '--project', './example', '--client=claude-code']),
    { command: 'install', project: './example', clients: ['claude'], mode: null },
  );
  assert.deepEqual(parseArguments(['install', '--client', 'codex']), {
    command: 'install', project: '.', clients: ['codex'], mode: null,
  });
  assert.deepEqual(parseArguments(['install']), {
    command: 'install', project: '.', clients: ['codex', 'claude'], mode: null,
  });
  assert.deepEqual(parseArguments(['install', '--mode', 'greenfield']), {
    command: 'install', project: '.', clients: ['codex', 'claude'], mode: 'GREENFIELD',
  });
});

test('CLI rejects ambiguous or unsupported install options', () => {
  assert.throws(() => parseArguments(['install', '--project']), /requires a value/);
  assert.throws(() => parseArguments(['install', '--client', 'cursor']), /Unsupported client/);
  assert.throws(() => parseArguments(['install', '--client=codex', '--client=claude']), /more than once/);
  assert.throws(() => parseArguments(['install', '--global']), /Unknown install option/);
  assert.throws(() => parseArguments(['install', '--mode', 'unknown']), /Unsupported mode/);
  assert.deepEqual(parseArguments(['install', '--yes']), {
    command: 'install', project: '.', clients: ['codex', 'claude'], mode: null, yes: true,
  });
  assert.throws(() => parseArguments(['install', '--yes=true']), /does not take a value/);
});

test('CLI rejects a file target before calling the installer', async () => {
  const stdout = output();
  const stderr = output();
  const code = await runCli(['install', '--project', './package.json'], {
    cwd: projectRoot, stdout: stdout.stream, stderr: stderr.stream,
  });
  assert.equal(code, 1);
  assert.match(stderr.read(), /Project path is not a directory/);
});

test('CLI rejects a missing project before reaching installer logic', async () => {
  const stdout = output();
  const stderr = output();
  const code = await runCli(['install', '--project', './does-not-exist', '--client', 'codex'], {
    cwd: projectRoot, stdout: stdout.stream, stderr: stderr.stream,
  });
  assert.equal(code, 1);
  assert.match(stderr.read(), /Project directory does not exist/);
});

test('executable reports the package version', () => {
  const version = execFileSync(process.execPath, [fileURLToPath(new URL('../bin/standards.js', import.meta.url)), '--version'], {
    encoding: 'utf8',
  });
  assert.equal(version, `${packageVersion}\n`);
});

test('CLI parses uninstall separately from install and rejects unsafe or ambiguous options', () => {
  assert.deepEqual(parseArguments(['uninstall']), {
    command: 'uninstall', project: '.', dryRun: false,
  });
  assert.deepEqual(parseArguments(['uninstall', '--project=./example', '--dry-run']), {
    command: 'uninstall', project: './example', dryRun: true,
  });
  for (const option of ['--force', '--client=codex', '--mode=greenfield', '--global']) {
    assert.throws(() => parseArguments(['uninstall', option]), /Unknown uninstall option/);
  }
  assert.throws(() => parseArguments(['uninstall', '--dry-run=true']), /does not take a value/);
  assert.throws(() => parseArguments(['uninstall', '--dry-run', '--dry-run']), /more than once/);
  assert.throws(() => parseArguments(['uninstall', '--project']), /requires a value/);
  assert.throws(() => parseArguments(['install', '--dry-run']), /Unknown install option/);
  assert.equal(parseArguments(['uninstall', '--yes']).yes, true);
});

function fakePrompts(answers) {
  const calls = [];
  const prompt = {
    calls,
    intro: (value) => calls.push(['intro', value]),
    outro: (value) => calls.push(['outro', value]),
    cancel: (value) => calls.push(['cancel', value]),
    note: (value, title) => calls.push(['note', title, value]),
    isCancel: (value) => typeof value === 'symbol',
  };
  for (const name of ['text', 'select', 'multiselect', 'confirm']) {
    prompt[name] = async (options) => {
      calls.push([name, options]);
      return answers.shift();
    };
  }
  return prompt;
}

async function temporaryProject(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'standards-cli-prompts-'));
  try { await run(root); } finally { await rm(root, { recursive: true, force: true }); }
}

test('interactive install asks for project, mode, and clients, then writes only after confirmation', () => temporaryProject(async (root) => {
  const stdout = output();
  stdout.stream.isTTY = true;
  const stderr = output();
  const prompts = fakePrompts([root, 'BROWNFIELD', ['codex'], false]);
  const environment = { cwd: projectRoot, stdin: { isTTY: true },
    stdout: stdout.stream, stderr: stderr.stream, prompts };
  assert.equal(await runCli(['install'], environment), 0);
  assert.deepEqual(await readdir(root), []);
  assert.deepEqual(prompts.calls.filter(([name]) => ['text', 'select', 'multiselect', 'confirm'].includes(name))
    .map(([name]) => name), ['text', 'select', 'multiselect', 'confirm']);
  const preview = prompts.calls.find(([name]) => name === 'note');
  assert.match(preview[2], /Mode: BROWNFIELD/);
  assert.match(preview[2], /Clients: codex/);
  assert.doesNotMatch(preview[2], /\.claude\/skills/);
  assert.equal(stderr.read(), '');

  prompts.calls.length = 0;
  prompts.confirm = async () => true;
  prompts.text = async () => root;
  prompts.select = async () => 'BROWNFIELD';
  prompts.multiselect = async () => ['codex'];
  assert.equal(await runCli(['install'], environment), 0);
  assert.match(stdout.read(), /Installed STANDARDS/);
  assert.equal((await readdir(root)).includes('.standards'), true);
  assert.equal((await readdir(root)).includes('.agents'), true);
  assert.equal((await readdir(root)).includes('.claude'), false);
}));

test('interactive uninstall previews full removal and preserves files when declined', () => temporaryProject(async (root) => {
  const stdout = output();
  stdout.stream.isTTY = true;
  const stderr = output();
  const environment = { cwd: root, stdin: { isTTY: true },
    stdout: stdout.stream, stderr: stderr.stream };
  const installPrompts = fakePrompts(['GREENFIELD', ['codex', 'claude'], true]);
  assert.equal(await runCli(['install', '--project', root], { ...environment, prompts: installPrompts }), 0);

  const decline = fakePrompts([false]);
  assert.equal(await runCli(['uninstall', '--project', root], { ...environment, prompts: decline }), 0);
  assert.equal((await readdir(root)).includes('.standards'), true);
  const preview = decline.calls.find(([name]) => name === 'note');
  assert.match(preview[2], /remove: \.standards/);
  assert.match(preview[2], /Clients: codex, claude/);
  assert.match(preview[2], /cycle-ID history/);
  assert.deepEqual(decline.calls.filter(([name]) => name === 'confirm').length, 1);

  const approve = fakePrompts([true]);
  assert.equal(await runCli(['uninstall', '--project', root], { ...environment, prompts: approve }), 0);
  assert.equal((await readdir(root)).includes('.standards'), false);
  assert.match(stdout.read(), /Uninstalled STANDARDS/);
  assert.equal(stderr.read(), '');
}));

test('interactive install stops if the project changes after preview', () => temporaryProject(async (root) => {
  const stdout = output();
  stdout.stream.isTTY = true;
  const stderr = output();
  const prompts = fakePrompts(['GREENFIELD', ['codex', 'claude']]);
  prompts.confirm = async () => {
    await writeFile(path.join(root, 'AGENTS.md'), '# New project guidance\n');
    return true;
  };
  assert.equal(await runCli(['install', '--project', root], {
    cwd: root, stdin: { isTTY: true }, stdout: stdout.stream, stderr: stderr.stream, prompts,
  }), 1);
  assert.match(stderr.read(), /Project changed after the install preview/);
  assert.deepEqual(await readdir(root), ['AGENTS.md']);
}));

test('uninstall help explains deletion before resolving any project', async () => {
  const stdout = output();
  const stderr = output();
  assert.equal(await runCli(['uninstall', '--help'], {
    cwd: '/does-not-exist', stdout: stdout.stream, stderr: stderr.stream,
  }), 0);
  assert.match(stdout.read(), /entire .standards/);
  assert.match(stdout.read(), /cycle-ID history/);
  assert.match(stdout.read(), /global CLI stays installed/);
  assert.equal(stderr.read(), '');
});

test('uninstall rejects missing and file targets before touching project files', async () => {
  for (const project of ['./does-not-exist', './package.json']) {
    const stdout = output();
    const stderr = output();
    assert.equal(await runCli(['uninstall', '--project', project], {
      cwd: projectRoot, stdout: stdout.stream, stderr: stderr.stream,
    }), 1);
    assert.match(stderr.read(), /Project (directory does not exist|path is not a directory)/);
  }
});
