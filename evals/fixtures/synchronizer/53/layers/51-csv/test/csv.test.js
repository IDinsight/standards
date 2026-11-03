import assert from 'node:assert/strict';
import test from 'node:test';

import { toCsv } from '../src/csv.js';

test('writes a header row and one line per row', () => {
  assert.equal(toCsv([{ a: 1, b: 'x' }], ['a', 'b']), 'a,b\r\n1,x\r\n');
});

test('quotes fields with commas, quotes, or line breaks', () => {
  const row = { a: 'x,y', b: 'say "hi"', c: 'l1\nl2' };
  assert.equal(toCsv([row], ['a', 'b', 'c']), 'a,b,c\r\n"x,y","say ""hi""","l1\nl2"\r\n');
});

test('writes empty cells for missing values', () => {
  assert.equal(toCsv([{ a: null }], ['a', 'b']), 'a,b\r\n,\r\n');
});
