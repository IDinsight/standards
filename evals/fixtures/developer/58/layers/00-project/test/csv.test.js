import assert from 'node:assert/strict';
import test from 'node:test';

import { csvCell, csvLine } from '../src/csv.js';

test('plain values are left as they are', () => {
  assert.equal(csvCell('Hillside'), 'Hillside');
});

test('commas, quotes, and line breaks are quoted', () => {
  assert.equal(csvCell('a,b'), '"a,b"');
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  assert.equal(csvCell('line\nbreak'), '"line\nbreak"');
});

test('missing values become empty cells', () => {
  assert.equal(csvLine(['x', undefined, null]), 'x,,');
});

test('numbers and booleans are written as text', () => {
  assert.equal(csvLine([3, true]), '3,true');
});
