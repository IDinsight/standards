import assert from 'node:assert/strict';
import test from 'node:test';

import { invoiceTotal, lineTotal } from '../src/totals.js';

test('line total multiplies quantity by unit price', () => {
  assert.equal(lineTotal({ quantity: 3, unitPrice: 2.5 }), 7.5);
});

test('invoice total adds tax', () => {
  const result = invoiceTotal([{ quantity: 2, unitPrice: 10 }, { quantity: 1, unitPrice: 5 }], { taxRate: 0.08 });
  assert.deepEqual(result, { subtotal: 25, tax: 2, total: 27 });
});
