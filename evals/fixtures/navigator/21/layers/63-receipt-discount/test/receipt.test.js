import assert from 'node:assert/strict';
import test from 'node:test';

import { formatReceipt } from '../src/receipt.js';

const items = [
  { name: 'Notebook', unitPrice: 450, quantity: 2 },
  { name: 'Pen', unitPrice: 120, quantity: 5 },
];

test('receipt lists items and totals', () => {
  const text = formatReceipt({ items, taxRate: 0.08 });
  assert.equal(text, [
    'Notebook x2  $9.00',
    'Pen x5  $6.00',
    'Subtotal  $15.00',
    'Tax  $1.20',
    'Total  $16.20',
  ].join('\n'));
});

test('receipt shows a discount line when a code applies', () => {
  const text = formatReceipt({ items, taxRate: 0.08, discountCode: 'welcome5' });
  assert.equal(text, [
    'Notebook x2  $9.00',
    'Pen x5  $6.00',
    'Subtotal  $15.00',
    'Discount (WELCOME5)  -$5.00',
    'Tax  $0.80',
    'Total  $10.80',
  ].join('\n'));
});
