import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { loadItems, lowStock } from '../src/inventory.js';

const ITEMS = fileURLToPath(new URL('./data/items.json', import.meta.url));
const NO_ITEMS = fileURLToPath(new URL('./data/products.json', import.meta.url));

test('loads items with numeric quantities', () => {
  const items = loadItems(ITEMS);
  assert.equal(items.length, 3);
  assert.deepEqual(items[1], { sku: 'SKU-1002', name: 'Washer, wide', quantity: 3 });
});

test('rejects a file without an items array', () => {
  assert.throws(() => loadItems(NO_ITEMS), /expected an "items" array/);
});

test('lowStock keeps items below the threshold', () => {
  assert.deepEqual(lowStock(loadItems(ITEMS), 5).map((item) => item.sku), ['SKU-1002']);
});
