import assert from 'node:assert/strict';
import test from 'node:test';

import { reportRows, summarize } from '../src/inventory.js';

const items = [
  { sku: 'P-30', name: 'Pulley', quantity: 7 },
  { sku: 'G-10', name: 'Gear', quantity: 3 },
];

test('summarize totals units across skus', () => {
  assert.deepEqual(summarize(items), { skus: 2, units: 10 });
});

test('report rows are sorted by sku', () => {
  assert.deepEqual(reportRows(items).map((row) => row.sku), ['G-10', 'P-30']);
});
