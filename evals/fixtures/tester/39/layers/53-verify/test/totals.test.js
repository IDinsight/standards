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

test('percentage discount is applied before tax', () => {
  const totals = orderTotals(cart, { discountCode: 'SPRING10', today: '2026-09-01' });
  assert.equal(totals.subtotal, 50);
  assert.equal(totals.discount, 5);
  assert.equal(totals.tax, 3.6);
  assert.equal(totals.total, 48.6);
});

test('unknown discount code stops the calculation', () => {
  assert.throws(() => orderTotals(cart, { discountCode: 'NOPE', today: '2026-09-01' }), /NOPE/);
});
