import assert from 'node:assert/strict';
import test from 'node:test';

import { difference, intersection, normalizeTag, union } from '../src/tags.js';

test('normalizeTag trims and lowercases', () => {
  assert.equal(normalizeTag('  Work '), 'work');
});

test('union keeps every value once and leaves inputs alone', () => {
  const a = new Set(['a', 'b']);
  const b = new Set(['b', 'c']);
  assert.deepEqual([...union(a, b)].sort(), ['a', 'b', 'c']);
  assert.deepEqual([...a], ['a', 'b']);
});

test('intersection keeps shared values', () => {
  assert.deepEqual([...intersection(new Set(['a', 'b']), new Set(['b', 'c']))], ['b']);
});

test('difference keeps values missing from the second set', () => {
  assert.deepEqual([...difference(new Set(['a', 'b']), new Set(['b', 'c']))], ['a']);
});
