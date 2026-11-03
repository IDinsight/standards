import assert from 'node:assert/strict';
import test from 'node:test';

import { ProductStore } from '../src/store.js';

test('put then get returns a copy of the stored product', () => {
  const store = new ProductStore();
  store.put({ sku: 'A-1', name: 'Lamp', price: 12.5 });
  const product = store.get('A-1');
  assert.deepEqual(product, { sku: 'A-1', name: 'Lamp', price: 12.5 });
  product.price = 0;
  assert.equal(store.get('A-1').price, 12.5);
});

test('put replaces the cached value for an existing sku', () => {
  const store = new ProductStore();
  store.put({ sku: 'A-1', name: 'Lamp', price: 12.5 });
  store.get('A-1');
  store.put({ sku: 'A-1', name: 'Lamp', price: 14 });
  assert.equal(store.get('A-1').price, 14);
  assert.equal(store.cache.size, 1);
});

test('remove deletes the row and its cache entry', () => {
  const store = new ProductStore();
  store.put({ sku: 'A-1', name: 'Lamp', price: 12.5 });
  assert.equal(store.remove('A-1'), true);
  assert.equal(store.get('A-1'), null);
  assert.equal(store.cache.size, 0);
});

test('list returns products sorted by sku', () => {
  const store = new ProductStore();
  store.put({ sku: 'B-2', name: 'Desk', price: 140 });
  store.put({ sku: 'A-1', name: 'Lamp', price: 12.5 });
  assert.deepEqual(store.list().map((product) => product.sku), ['A-1', 'B-2']);
});
