import assert from 'node:assert/strict';
import test from 'node:test';

import { formatInvoice } from '../src/invoice.js';

test('prints one row per line and the total', () => {
  const text = formatInvoice({ number: 'INV-7', lines: [{ sku: 'A1', unitCents: 250, quantity: 3 }] });
  assert.equal(text, 'Invoice INV-7\nA1  3 x 2.50  7.50\nTotal  7.50');
});
