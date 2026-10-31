import assert from 'node:assert/strict';
import test from 'node:test';

import { addItem, adjustQuantity, createInventory, listItems } from '../src/inventory.js';

test('addItem stores a new item with defaults', () => {
  const inventory = createInventory();
  const item = addItem(inventory, { sku: 'BOLT-10', name: 'Bolt 10mm' });
  assert.deepEqual(item, { sku: 'BOLT-10', name: 'Bolt 10mm', quantity: 0, reorderLevel: null });
});

test('addItem rejects a duplicate sku', () => {
  const inventory = createInventory();
  addItem(inventory, { sku: 'BOLT-10', name: 'Bolt 10mm' });
  assert.throws(() => addItem(inventory, { sku: 'BOLT-10', name: 'Other' }), /duplicate sku/);
});

test('adjustQuantity changes quantity and refuses to go below zero', () => {
  const inventory = createInventory();
  addItem(inventory, { sku: 'NUT-6', name: 'Nut 6mm', quantity: 4 });
  assert.equal(adjustQuantity(inventory, 'NUT-6', -3).quantity, 1);
  assert.throws(() => adjustQuantity(inventory, 'NUT-6', -2), /below zero/);
  assert.equal(inventory.get('NUT-6').quantity, 1);
});

test('listItems returns items ordered by sku', () => {
  const inventory = createInventory();
  addItem(inventory, { sku: 'WASHER-8', name: 'Washer 8mm' });
  addItem(inventory, { sku: 'BOLT-10', name: 'Bolt 10mm' });
  assert.deepEqual(listItems(inventory).map((item) => item.sku), ['BOLT-10', 'WASHER-8']);
});
