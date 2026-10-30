import assert from 'node:assert/strict';
import test from 'node:test';

import { invoiceTotals, lineAmount } from '../src/totals.js';

test('lineAmount multiplies quantity by unit price', () => {
  assert.equal(lineAmount({ quantity: 3, unitPrice: 4.5 }), 13.5);
});

test('invoiceTotals adds tax to the subtotal', () => {
  const invoice = { lines: [{ quantity: 2, unitPrice: 50 }] };
  assert.deepEqual(invoiceTotals(invoice, 0.2), { subtotal: 100, tax: 20, total: 120 });
});
