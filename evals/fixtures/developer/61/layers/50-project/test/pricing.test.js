import assert from 'node:assert/strict';
import test from 'node:test';

import { lineTotal, orderTotal } from '../src/pricing.js';

const lines = [
  { sku: 'MUG-01', unitPrice: 12, quantity: 2 },
  { sku: 'CARD-07', unitPrice: 3.25, quantity: 4 },
];

test('line total multiplies unit price by quantity', () => {
  assert.equal(lineTotal({ unitPrice: 2.5, quantity: 4 }), 10);
});

test('order total sums line totals', () => {
  assert.equal(orderTotal({ lines }), 37);
});

test('promo code takes its percentage off the order', () => {
  assert.equal(orderTotal({ lines, promoCode: 'SPRING10' }), 33.3);
});

test('unknown promo codes are ignored', () => {
  assert.equal(orderTotal({ lines, promoCode: 'NOPE' }), 37);
});
