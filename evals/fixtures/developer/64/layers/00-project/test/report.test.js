import assert from 'node:assert/strict';
import test from 'node:test';

import { addItem, createInventory } from '../src/inventory.js';
import { stockSummary } from '../src/report.js';

test('stockSummary counts items and units', () => {
  const inventory = createInventory();
  addItem(inventory, { sku: 'BOLT-10', name: 'Bolt 10mm', quantity: 12 });
  addItem(inventory, { sku: 'NUT-6', name: 'Nut 6mm', quantity: 5 });
  assert.deepEqual(stockSummary(inventory), { itemCount: 2, totalUnits: 17 });
});

test('stockSummary of an empty inventory', () => {
  assert.deepEqual(stockSummary(createInventory()), { itemCount: 0, totalUnits: 0 });
});
