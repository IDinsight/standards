import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { ConfigError, DEFAULTS, loadConfig } from '../src/config.js';

async function configFile(contents) {
  const dir = await mkdtemp(join(tmpdir(), 'svc-config-'));
  const file = join(dir, 'config.json');
  await writeFile(file, contents);
  return file;
}

test('a missing file gives the defaults', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'svc-config-'));
  assert.deepEqual(await loadConfig(join(dir, 'config.json')), DEFAULTS);
});

test('file values override the defaults', async () => {
  const file = await configFile('{"port": 9000, "logLevel": "warn"}');
  assert.deepEqual(await loadConfig(file), { host: '127.0.0.1', port: 9000, logLevel: 'warn' });
});

test('invalid JSON is rejected', async () => {
  const file = await configFile('{"port": ');
  await assert.rejects(loadConfig(file), ConfigError);
});

test('an out-of-range port is rejected', async () => {
  const file = await configFile('{"port": 70000}');
  await assert.rejects(loadConfig(file), ConfigError);
});
