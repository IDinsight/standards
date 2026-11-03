import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { DEFAULTS, loadConfig } from '../src/config.js';

const tempDir = () => mkdtempSync(path.join(tmpdir(), 'mdtoc-'));

test('defaults apply without a config file', () => {
  assert.deepEqual(loadConfig(tempDir()), { maxDepth: 3, bullet: '-' });
});

test('config file values override defaults', () => {
  const dir = tempDir();
  writeFileSync(path.join(dir, '.mdtocrc.json'), JSON.stringify({ maxDepth: 4 }));
  assert.deepEqual(loadConfig(dir), { ...DEFAULTS, maxDepth: 4 });
});

test('invalid values are rejected', () => {
  const dir = tempDir();
  writeFileSync(path.join(dir, '.mdtocrc.json'), JSON.stringify({ bullet: '>' }));
  assert.throws(() => loadConfig(dir), /bullet/);
});
