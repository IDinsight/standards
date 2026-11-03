import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { rotate, shouldRotate } from '../src/rotate.js';

function logPath(t) {
  const dir = mkdtempSync(path.join(tmpdir(), 'rotalog-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return path.join(dir, 'app.log');
}

test('shouldRotate is false for a missing file', (t) => {
  assert.equal(shouldRotate(logPath(t)), false);
});

test('shouldRotate is true once the file reaches maxBytes', (t) => {
  const file = logPath(t);
  writeFileSync(file, 'x'.repeat(10));
  assert.equal(shouldRotate(file, { maxBytes: 11 }), false);
  assert.equal(shouldRotate(file, { maxBytes: 10 }), true);
});

test('rotate shifts backups and drops the oldest', (t) => {
  const file = logPath(t);
  writeFileSync(file + '.1', 'one');
  writeFileSync(file + '.2', 'two');
  writeFileSync(file, 'current');
  assert.equal(rotate(file, { keep: 2 }), true);
  assert.equal(readFileSync(file + '.1', 'utf8'), 'current');
  assert.equal(readFileSync(file + '.2', 'utf8'), 'one');
  assert.equal(existsSync(file + '.3'), false);
  assert.equal(existsSync(file), false);
});

test('rotate rejects a keep that is not a positive integer', (t) => {
  assert.throws(() => rotate(logPath(t), { keep: 0 }), RangeError);
});
