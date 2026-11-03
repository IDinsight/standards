import assert from 'node:assert/strict';
import test from 'node:test';

import { Catalog } from '../src/catalog.js';

test('get returns the latest upserted product', () => {
  const catalog = new Catalog();
  catalog.upsert({ sku: 'A1', name: 'Bolt', quantity: 4 });
  assert.equal(catalog.get('A1').quantity, 4);
  catalog.upsert({ sku: 'A1', name: 'Bolt', quantity: 9 });
  assert.equal(catalog.get('A1').quantity, 9);
});

test('list is sorted by sku', () => {
  const catalog = new Catalog();
  catalog.upsert({ sku: 'B2', name: 'Nut', quantity: 1 });
  catalog.upsert({ sku: 'A1', name: 'Bolt', quantity: 4 });
  assert.deepEqual(catalog.list().map((product) => product.sku), ['A1', 'B2']);
});
