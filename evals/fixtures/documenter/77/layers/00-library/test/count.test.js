import assert from 'node:assert/strict';
import test from 'node:test';

import { count } from '../src/count.js';

test('empty text counts zero in every mode', () => {
  for (const mode of ['lines', 'words', 'chars']) assert.equal(count('', { mode }), 0);
});

test('lines count a final line without a newline', () => {
  assert.equal(count('a\nb\n'), 2);
  assert.equal(count('a\nb'), 2);
});

test('words split on any whitespace', () => {
  assert.equal(count('  one two\tthree\nfour ', { mode: 'words' }), 4);
});

test('chars count code points', () => {
  assert.equal(count('h\u00e9\u{1F600}', { mode: 'chars' }), 3);
});

test('unknown modes are rejected', () => {
  assert.throws(() => count('x', { mode: 'bytes' }), /unknown mode/);
});
