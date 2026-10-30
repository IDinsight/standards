import assert from 'node:assert/strict';
import { test } from 'node:test';

import { escapeCell } from '../src/csv.ts';
import { parseCsv } from '../src/parse-csv.ts';

test('parseCsv reads quoted fields with commas and doubled quotes', () => {
  assert.deepEqual(parseCsv('a,"x, y","say ""hi"""\r\nb,c,d'), [['a', 'x, y', 'say "hi"'], ['b', 'c', 'd']]);
});

test('parseCsv keeps line breaks inside quoted fields', () => {
  assert.deepEqual(parseCsv('"one\ntwo",3\n'), [['one\ntwo', '3']]);
});

test('escapeCell quotes commas and double quotes and leaves other values alone', () => {
  assert.equal(escapeCell('plain text'), 'plain text');
  assert.equal(escapeCell(7), '7');
  assert.equal(escapeCell('a, b'), '"a, b"');
  assert.equal(escapeCell('say "hi"'), '"say ""hi"""');
});
