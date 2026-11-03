import assert from 'node:assert/strict';
import test from 'node:test';

import { parseRecords, totalQuantity } from '../src/records.js';

test('parses records and skips comments and blank lines', () => {
  const records = parseRecords('# header\n{"sku":"A","qty":1}\n\n{"sku":"B","qty":2,"location":"X"}\n');
  assert.deepEqual(records, [
    { sku: 'A', qty: 1, location: null },
    { sku: 'B', qty: 2, location: 'X' },
  ]);
});

test('rejects a record without an integer qty', () => {
  assert.throws(() => parseRecords('{"sku":"A","qty":"1"}'), /line 1/);
});

test('rejects malformed JSON with its line number', () => {
  assert.throws(() => parseRecords('{"sku":"A","qty":1}\n{oops'), /line 2: not valid JSON/);
});

test('totals quantities', () => {
  assert.equal(totalQuantity([{ qty: 3 }, { qty: 4 }]), 7);
});
