import assert from 'node:assert/strict';
import test from 'node:test';

import { lineTotal, orderTotal, subtotal } from '../src/totals.js';

const lines = [
  { sku: 'TEA-01', qty: 2, unitCents: 450 },
  { sku: 'MUG-03', qty: 1, unitCents: 1200 },
];

test('lineTotal multiplies quantity by unit price', () => {
  assert.equal(lineTotal({ sku: 'TEA-01', qty: 3, unitCents: 450 }), 1350);
});

test('subtotal sums every line', () => {
  assert.equal(subtotal(lines), 2100);
});

test('a quantity below one is rejected', () => {
  assert.throws(() => lineTotal({ sku: 'TEA-01', qty: 0, unitCents: 450 }), RangeError);
});

test('orderTotal of an empty order is zero', () => {
  assert.equal(orderTotal([]), 0);
});
