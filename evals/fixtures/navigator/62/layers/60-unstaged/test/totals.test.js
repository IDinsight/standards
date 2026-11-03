import assert from 'node:assert/strict';
import test from 'node:test';

import { invoiceTotal, lineTotal } from '../src/totals.js';

test('line total multiplies quantity by unit price', () => {
  assert.equal(lineTotal({ quantity: 3, unitPrice: 2.5 }), 7.5);
});

test('invoice total adds tax', () => {
  const result = invoiceTotal([{ quantity: 2, unitPrice: 10 }, { quantity: 1, unitPrice: 5 }], { taxRate: 0.08 });
  assert.deepEqual(result, { subtotal: 25, discount: 0, tax: 2, total: 27 });
});

test('discount is applied before tax', () => {
  const result = invoiceTotal([{ quantity: 4, unitPrice: 25 }], { taxRate: 0.08, discountRate: 0.1 });
  assert.deepEqual(result, { subtotal: 100, discount: 10, tax: 7.2, total: 97.2 });
});

test('discount rate outside 0..1 is rejected', () => {
  assert.throws(() => invoiceTotal([{ quantity: 1, unitPrice: 1 }], { discountRate: 1.5 }), RangeError);
});
