import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { parseCsv } from '../src/csv.js';

const fixture = readFileSync(new URL('./fixtures/records.csv', import.meta.url), 'utf8');

test('splits plain fields, keeping empty ones', () => {
  assert.deepEqual(parseCsv('a,,c\r\n'), [['a', '', 'c']]);
});

test('quoted fields keep commas and doubled quotes', () => {
  assert.deepEqual(parseCsv('1,"a, b","say ""hi"""\r\n'), [['1', 'a, b', 'say "hi"']]);
});

test('accepts CRLF and LF row endings and a missing final line break', () => {
  assert.deepEqual(parseCsv('a,b\r\nc,d\ne,f'), [['a', 'b'], ['c', 'd'], ['e', 'f']]);
});

test('the sample file parses into a header and four records of four fields', () => {
  const rows = parseCsv(fixture);
  assert.equal(rows.length, 5);
  assert.ok(rows.every((row) => row.length === 4));
});
