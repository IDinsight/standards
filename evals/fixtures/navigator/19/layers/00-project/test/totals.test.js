import assert from 'node:assert/strict';
import test from 'node:test';

import { formatAmount, invoiceTotal, lineTotal } from '../src/totals.js';

test('lineTotal multiplies quantity by unit price', () => {
  assert.equal(lineTotal({ quantity: 2, unitPrice: 1.25 }), 2.5);
});

test('invoiceTotal sums every line', () => {
  const lines = [
    { quantity: 2, unitPrice: 1.25 },
    { quantity: 1, unitPrice: 4 },
  ];
  assert.equal(invoiceTotal(lines), 6.5);
});

test('formatAmount shows two decimals', () => {
  assert.equal(formatAmount(6.5), '6.50');
});
