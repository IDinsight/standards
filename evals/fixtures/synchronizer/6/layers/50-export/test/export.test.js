import assert from 'node:assert/strict';
import test from 'node:test';

import { toCsv } from '../src/export.js';

test('writes a header row and one line per record', () => {
  const csv = toCsv([{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }]);
  assert.equal(csv, 'id,name\r\n1,Ada\r\n2,Grace\r\n');
});

test('quotes fields with commas, quotes, and line breaks', () => {
  const csv = toCsv([{ name: 'Lovelace, Ada', note: 'said "hi"', addr: 'line 1\nline 2' }]);
  assert.equal(csv, 'name,note,addr\r\n"Lovelace, Ada","said ""hi""","line 1\nline 2"\r\n');
});

test('returns an empty string when there are no columns', () => {
  assert.equal(toCsv([]), '');
});

test('writes empty cells for missing values', () => {
  assert.equal(toCsv([{ a: null, b: undefined }], ['a', 'b', 'c']), 'a,b,c\r\n,,\r\n');
});
