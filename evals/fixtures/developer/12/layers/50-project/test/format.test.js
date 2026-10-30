import assert from 'node:assert/strict';
import test from 'node:test';

import { formatTable } from '../src/format.js';

test('formatTable aligns columns', () => {
  const text = formatTable([
    { sku: 'RICE-5', name: 'Rice 5kg', quantity: 3 },
    { sku: 'TEA', name: 'Tea', quantity: 12 },
  ]);
  assert.equal(text, ['SKU     NAME      QTY', 'RICE-5  Rice 5kg  3', 'TEA     Tea       12'].join('\n'));
});

test('formatTable reports an empty inventory', () => {
  assert.equal(formatTable([]), 'No items.');
});
