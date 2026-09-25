import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { parseArguments, runCli } from '../lib/cli.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

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
  assert.equal(version, '0.0.0\n');
});
