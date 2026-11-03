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

test('matches header names regardless of case, spacing, and order', () => {
  const rows = parseCsv(' Price , SKU,Name\n9.99,C-3,Chair\n');
  assert.deepEqual(rows, [{ sku: 'C-3', name: 'Chair', price: 9.99 }]);
});

test('ignores columns it does not use', () => {
  const rows = parseCsv('sku,name,price,supplier\nA-1,Lamp,12.5,Northwind\n');
  assert.deepEqual(rows, [{ sku: 'A-1', name: 'Lamp', price: 12.5 }]);
});

test('names a missing required column', () => {
  assert.throws(
    () => parseCsv('sku,price\nA-1,12.5\n'),
    (error) => error instanceof ImportError && error.message === 'missing column name',
  );
});

test('rejects a row with the wrong number of fields', () => {
  assert.throws(() => parseCsv('sku,name,price\nA-1,Lamp\n'), /line 2: expected 3 fields/);
});

test('rejects a price that is not a number', () => {
  assert.throws(() => parseCsv('sku,name,price\nA-1,Lamp,cheap\n'), /line 2: invalid price/);
});

test('skips blank lines', () => {
  const rows = parseCsv('sku,name,price\n\nA-1,Lamp,12.5\n   \n');
  assert.equal(rows.length, 1);
});
