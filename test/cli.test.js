import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
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
});

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
