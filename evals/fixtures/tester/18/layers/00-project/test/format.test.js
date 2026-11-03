import assert from 'node:assert/strict';
import test from 'node:test';

import { formatBytes } from '../src/format.js';

test('formats values below one kilobyte as whole bytes', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(999), '999 B');
});

test('formats larger values with decimal units', () => {
  assert.equal(formatBytes(1500), '1.5 kB');
  assert.equal(formatBytes(2_000_000), '2.0 MB');
});

test('rejects negative input', () => {
  assert.throws(() => formatBytes(-1), RangeError);
});
