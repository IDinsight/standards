import assert from 'node:assert/strict';
import test from 'node:test';

import { createInvoice, subtotalCents, totals } from '../src/invoice.js';

const lines = [
  { description: 'Widget', quantity: 3, unitPrice: '4.99' },
  { description: 'Setup fee', quantity: 1, unitPrice: '25' },
];

test('createInvoice requires a customer and at least one line', () => {
  assert.throws(() => createInvoice({ lines }), /customer/);
  assert.throws(() => createInvoice({ customer: 'ACME', lines: [] }), /at least one line/);
});

test('subtotal sums quantity times unit price', () => {
  const invoice = createInvoice({ customer: 'ACME', lines });
  assert.equal(subtotalCents(invoice), 3 * 499 + 2500);
});

test('totals add tax on the subtotal', () => {
  const invoice = createInvoice({ customer: 'ACME', lines, taxRatePercent: 8 });
  const result = totals(invoice);
  assert.equal(result.subtotalCents, 3997);
  assert.equal(result.taxCents, 320);
  assert.equal(result.totalCents, 4317);
});
