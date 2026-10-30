import assert from 'node:assert/strict';
import test from 'node:test';

import { addItem, adjust, createInventory, listItems, setReorderLevel } from '../src/inventory.js';

test('addItem stores a new item with no reorder level by default', () => {
  const inventory = createInventory();
  addItem(inventory, { sku: 'RICE-5', name: 'Rice 5kg', quantity: 3 });
  assert.deepEqual(inventory.items, [{ sku: 'RICE-5', name: 'Rice 5kg', quantity: 3, reorderLevel: null }]);
});

test('addItem rejects a duplicate sku', () => {
  const inventory = createInventory([{ sku: 'TEA', name: 'Tea', quantity: 1, reorderLevel: null }]);
  assert.throws(() => addItem(inventory, { sku: 'TEA', name: 'Green tea' }), /duplicate sku/);
});

test('adjust refuses to take stock below zero', () => {
  const inventory = createInventory([{ sku: 'OIL', name: 'Olive oil', quantity: 1, reorderLevel: 2 }]);
  assert.throws(() => adjust(inventory, 'OIL', -2), /not enough stock/);
  assert.equal(inventory.items[0].quantity, 1);
});

test('setReorderLevel can clear a level', () => {
  const inventory = createInventory([{ sku: 'OIL', name: 'Olive oil', quantity: 1, reorderLevel: 2 }]);
  setReorderLevel(inventory, 'OIL', null);
  assert.equal(inventory.items[0].reorderLevel, null);
});

test('listItems sorts by name', () => {
  const inventory = createInventory([
    { sku: 'B', name: 'Sugar', quantity: 1, reorderLevel: null },
    { sku: 'A', name: 'Flour', quantity: 2, reorderLevel: null },
  ]);
  assert.deepEqual(listItems(inventory).map((item) => item.sku), ['A', 'B']);
});
