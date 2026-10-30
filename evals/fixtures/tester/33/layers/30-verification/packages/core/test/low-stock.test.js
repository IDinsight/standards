import assert from 'node:assert/strict';
import test from 'node:test';

import { reportRows } from '../src/inventory.js';
import { DEFAULT_REORDER_AT, isLowStock, lowStock } from '../src/lowStock.js';

test('marks an item below its reorder threshold', () => {
  assert.equal(isLowStock({ sku: 'A1', quantity: 2, reorderAt: 3 }), true);
});

test('marks an item at its reorder threshold', () => {
  assert.equal(isLowStock({ sku: 'A2', quantity: 3, reorderAt: 3 }), true);
});

test('does not mark an item above its reorder threshold', () => {
  assert.equal(isLowStock({ sku: 'A3', quantity: 4, reorderAt: 3 }), false);
});

test('uses the default threshold when none is set', () => {
  const items = [
    { sku: 'B1', quantity: 4 },
    { sku: 'B2', quantity: 5 },
    { sku: 'B3', quantity: 9 },
  ];
  assert.equal(DEFAULT_REORDER_AT, 5);
  assert.deepEqual(lowStock(items).map((item) => item.sku), ['B1']);
});

test('report rows carry the low-stock flag', () => {
  const rows = reportRows([
    { sku: 'C2', name: 'Hinge', quantity: 12, reorderAt: 10 },
    { sku: 'C1', name: 'Bracket', quantity: 1 },
  ]);
  assert.deepEqual(rows.map((row) => [row.sku, row.lowStock]), [['C1', true], ['C2', false]]);
});
