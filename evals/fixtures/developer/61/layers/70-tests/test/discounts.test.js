import assert from 'node:assert/strict';
import test from 'node:test';

import { discountRate } from '../src/discounts.js';
import { lineTotal, orderTotal, priceOrder } from '../src/pricing.js';

test('discount tiers start at 10, 50, and 100 units', () => {
  assert.equal(discountRate(9), 0);
  assert.equal(discountRate(10), 0.05);
  assert.equal(discountRate(49), 0.05);
  assert.equal(discountRate(50), 0.1);
  assert.equal(discountRate(100), 0.15);
});

test('line total applies the tier for its quantity', () => {
  assert.equal(lineTotal({ unitPrice: 4, quantity: 10 }), 38);
});

test('line total is rounded once for the whole line', () => {
  assert.equal(lineTotal({ unitPrice: 0.99, quantity: 50 }), 44.55);
});

test('promo code applies to the discounted subtotal', () => {
  const order = { lines: [{ unitPrice: 4, quantity: 10 }], promoCode: 'STAFF20' };
  assert.equal(orderTotal(order), 30.4);
});

test('priced order reports line, promo, and total amounts', () => {
  const priced = priceOrder({
    lines: [{ sku: 'PEN-12', unitPrice: 4, quantity: 10 }],
    promoCode: 'SPRING10',
  });
  assert.equal(priced.lines[0].discount, 2);
  assert.equal(priced.lines[0].total, 38);
  assert.equal(priced.subtotal, 38);
  assert.equal(priced.promoDiscount, 3.8);
  assert.equal(priced.total, 34.2);
});
