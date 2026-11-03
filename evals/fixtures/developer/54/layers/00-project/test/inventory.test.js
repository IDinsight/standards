import assert from 'node:assert/strict';
import test from 'node:test';

import { adjustQuantity, loadItems, totalUnits } from '../src/inventory.js';

const records = [
  { sku: ' A1 ', name: 'Axle', quantity: '5', reorderLevel: '5' },
  { sku: 'B2', name: ' Bolt ', quantity: 12 },
];

test('loadItems trims text fields and converts numbers', () => {
  assert.deepEqual(loadItems(records), [
    { sku: 'A1', name: 'Axle', quantity: 5, reorderLevel: 5 },
    { sku: 'B2', name: 'Bolt', quantity: 12, reorderLevel: 0 },
  ]);
});

test('adjustQuantity changes only the matching item', () => {
  const items = loadItems(records);
  const next = adjustQuantity(items, 'B2', -3);
  assert.equal(next[1].quantity, 9);
  assert.equal(next[0].quantity, 5);
  assert.equal(items[1].quantity, 12);
});

test('totalUnits sums quantities', () => {
  assert.equal(totalUnits(loadItems(records)), 17);
});
