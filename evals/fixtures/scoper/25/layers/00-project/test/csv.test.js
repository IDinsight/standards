import assert from 'node:assert/strict';
import test from 'node:test';

import { quote, toCsv } from '../src/csv.js';

test('quotes values containing the delimiter, quotes, or line breaks', () => {
  assert.equal(quote('a,b', ','), '"a,b"');
  assert.equal(quote('say "hi"', ','), '"say ""hi"""');
  assert.equal(quote('two\nlines', ','), '"two\nlines"');
  assert.equal(quote('a,b', ';'), 'a,b');
  assert.equal(quote('a;b', ';'), '"a;b"');
});

test('writes missing and null values as empty cells', () => {
  assert.equal(toCsv([{ id: 1, note: null }, { id: 2 }], ['id', 'note']), 'id,note\n1,\n2,\n');
});

test('returns an empty string when there are no fields', () => {
  assert.equal(toCsv([], []), '');
});
