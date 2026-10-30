import assert from 'node:assert/strict';
import test from 'node:test';

import { ImportError, importCsv, parseCsv } from '../src/import.js';
import { ProductStore } from '../src/store.js';

test('imports every row into the store', () => {
  const store = new ProductStore();
  const result = importCsv(store, 'sku,name,price\nA-1,Lamp,12.5\nB-2,Desk,140\n');
  assert.deepEqual(result, { imported: 2 });
  assert.deepEqual(store.get('B-2'), { sku: 'B-2', name: 'Desk', price: 140 });
});

test('rejects a header other than sku,name,price', () => {
  assert.throws(() => parseCsv('SKU,Name,Price\nA-1,Lamp,12.5\n'), ImportError);
});

test('rejects a row with the wrong number of fields', () => {
  assert.throws(() => parseCsv('sku,name,price\nA-1,Lamp\n'), /line 2: expected 3 fields/);
});

test('rejects a price that is not a number', () => {
  assert.throws(() => parseCsv('sku,name,price\nA-1,Lamp,cheap\n'), /line 2: invalid price/);
});
