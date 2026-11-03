import assert from 'node:assert/strict';
import test from 'node:test';

import { orderTotals } from '../src/totals.js';

const cart = [
  { price: 20, quantity: 2 },
  { price: 10, quantity: 1 },
];

test('subtotal, tax, and total for a cart', () => {
  const totals = orderTotals(cart);
  assert.equal(totals.subtotal, 50);
  assert.equal(totals.tax, 4);
  assert.equal(totals.total, 54);
});
