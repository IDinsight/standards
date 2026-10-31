import assert from 'node:assert/strict';
import test from 'node:test';

import { formatBytes, parseBytes } from '../src/bytes.js';

test('formats small counts as bytes', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(999), '999 B');
});

test('formats larger counts with one decimal', () => {
  assert.equal(formatBytes(1500), '1.5 KB');
  assert.equal(formatBytes(1500000), '1.5 MB');
});

test('rejects negative and non-finite input', () => {
  assert.throws(() => formatBytes(-1), RangeError);
  assert.throws(() => formatBytes(Infinity), RangeError);
});

test('parses labels', () => {
  assert.equal(parseBytes('2 KB'), 2000);
  assert.equal(parseBytes('10'), 10);
});
