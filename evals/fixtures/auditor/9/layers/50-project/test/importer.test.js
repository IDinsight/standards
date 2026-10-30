import assert from 'node:assert/strict';
import test from 'node:test';

import { Catalog } from '../src/catalog.js';
import { importProducts, parseProducts } from '../src/importer.js';

test('parses comma-separated rows', () => {
  const { products, skipped } = parseProducts('sku,name,quantity\nA1,Bolt,4\nB2,Nut,10\n');
  assert.deepEqual(products, [
    { sku: 'A1', name: 'Bolt', quantity: 4 },
    { sku: 'B2', name: 'Nut', quantity: 10 },
  ]);
  assert.equal(skipped, 0);
});

test('skips rows without a sku or with a bad quantity', () => {
  const { products, skipped } = parseProducts('sku,name,quantity\n,Washer,3\nC3,Pin,-1\nD4,Clip,two\nE5,Rivet,7\n');
  assert.deepEqual(products.map((product) => product.sku), ['E5']);
  assert.equal(skipped, 3);
});

test('rejects a file without the required columns', () => {
  assert.throws(() => parseProducts('sku,name\nA1,Bolt\n'), /missing column: quantity/);
});

test('importProducts upserts valid rows into the catalog', () => {
  const catalog = new Catalog();
  const result = importProducts(catalog, 'sku,name,quantity\nA1,Bolt,4\n,Nut,1\n');
  assert.deepEqual(result, { imported: 1, skipped: 1 });
  assert.equal(catalog.get('A1').name, 'Bolt');
});
