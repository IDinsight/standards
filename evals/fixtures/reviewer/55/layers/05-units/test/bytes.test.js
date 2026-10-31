import assert from 'node:assert/strict';
import test from 'node:test';

import { formatBytes, parseBytes } from '../src/bytes.js';

test('formats small counts as bytes', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1023), '1023 B');
});

test('formats binary multiples with one decimal', () => {
  assert.equal(formatBytes(1536), '1.5 KiB');
  assert.equal(formatBytes(5 * 1024 ** 3), '5.0 GiB');
});

test('honours the digits option', () => {
  assert.equal(formatBytes(1536, { digits: 2 }), '1.50 KiB');
});

test('rejects negative and non-finite input', () => {
  assert.throws(() => formatBytes(-1), RangeError);
  assert.throws(() => formatBytes(Infinity), RangeError);
});

test('parses labels', () => {
  assert.equal(parseBytes('2 KiB'), 2048);
  assert.equal(parseBytes('10'), 10);
  assert.equal(parseBytes('1.5 MiB'), 1572864);
});

test('rejects unknown units', () => {
  assert.throws(() => parseBytes('3 parsecs'), SyntaxError);
});
