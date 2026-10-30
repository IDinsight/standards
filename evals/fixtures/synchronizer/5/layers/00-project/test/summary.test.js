import assert from 'node:assert/strict';
import test from 'node:test';

import { invoiceTotal, summaryLine } from '../src/summary.js';

test('invoiceTotal sums quantity times unit price', () => {
  assert.equal(invoiceTotal([{ quantity: 2, unitPrice: 5 }, { quantity: 1, unitPrice: 7 }]), 17);
});

test('summaryLine names the invoice and item count', () => {
  const line = summaryLine({ number: 'INV-7', currency: 'EUR', lines: [{ quantity: 1, unitPrice: 9 }] });
  assert.match(line, /^INV-7: 1 item\(s\), total EUR /);
});
