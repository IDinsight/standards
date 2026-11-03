import assert from 'node:assert/strict';
import test from 'node:test';

import { parseCsv } from '../src/csv.js';
import { summarize } from '../src/summarize.js';

test('parseCsv reads the header and trims cells', () => {
  const { header, rows } = parseCsv('name, qty\n a ,2\n\nb,\n');
  assert.deepEqual(header, ['name', 'qty']);
  assert.deepEqual(rows, [{ name: 'a', qty: '2' }, { name: 'b', qty: '' }]);
});

test('summarize skips empty and non-numeric cells', () => {
  const rows = [{ v: '1.25' }, { v: 'n/a' }, { v: '' }, { v: '2.5' }];
  assert.deepEqual(summarize(rows, 'v'), { count: 2, skipped: 2, sum: 3.75, min: 1.25, max: 2.5, mean: 1.88 });
});

test('summarize returns nulls when no values are numeric', () => {
  assert.deepEqual(summarize([{ v: 'x' }], 'v'), { count: 0, skipped: 1, sum: 0, min: null, max: null, mean: null });
});
