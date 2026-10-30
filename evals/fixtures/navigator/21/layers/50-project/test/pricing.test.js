import assert from 'node:assert/strict';
import test from 'node:test';

import { totals } from '../src/pricing.js';

const items = [
  { name: 'Notebook', unitPrice: 450, quantity: 2 },
  { name: 'Pen', unitPrice: 120, quantity: 5 },
];

test('totals adds tax to the subtotal', () => {
  assert.deepEqual(totals(items), { subtotal: 1500, tax: 120, total: 1620 });
});

test('totals honours a custom tax rate', () => {
  assert.deepEqual(totals(items, { taxRate: 0 }), { subtotal: 1500, tax: 0, total: 1500 });
});
