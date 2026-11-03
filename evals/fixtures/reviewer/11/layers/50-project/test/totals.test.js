import assert from 'node:assert/strict';
import test from 'node:test';

import { summarize } from '../src/invoice.js';
import { invoiceTotal, lineTotal } from '../src/totals.js';

test('lineTotal multiplies quantity by unit price', () => {
  assert.equal(lineTotal({ quantity: 2, unitPrice: 3.5 }), 7);
});

test('invoiceTotal sums every line', () => {
  const invoice = { lines: [{ quantity: 2, unitPrice: 3.5 }, { quantity: 1, unitPrice: 4.25 }] };
  assert.equal(invoiceTotal(invoice), 11.25);
});

test('summarize reports currency, line count, and total', () => {
  const invoice = { number: 'INV-7', currency: 'USD', lines: [{ quantity: 1, unitPrice: 10 }] };
  assert.deepEqual(summarize(invoice), { number: 'INV-7', currency: 'USD', lineCount: 1, total: 10 });
});
