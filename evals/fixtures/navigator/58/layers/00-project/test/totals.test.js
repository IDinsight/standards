import assert from 'node:assert/strict';
import test from 'node:test';

import { applyDiscount, invoiceTotal, lineTotalCents } from '../src/totals.js';

test('line total multiplies price by quantity', () => {
  assert.equal(lineTotalCents({ unitPriceCents: 250, quantity: 4 }), 1000);
});

test('line total rejects a zero quantity', () => {
  assert.throws(() => lineTotalCents({ unitPriceCents: 250, quantity: 0 }), RangeError);
});

test('percent discount is rounded to the nearest cent', () => {
  assert.equal(applyDiscount(1000, { type: 'percent', value: 10 }), 900);
});

test('fixed discount never goes below zero', () => {
  assert.equal(applyDiscount(500, { type: 'fixed', valueCents: 800 }), 0);
});

test('invoice total applies tax after the discount', () => {
  const items = [
    { unitPriceCents: 250, quantity: 4 },
    { unitPriceCents: 1999, quantity: 1 },
  ];
  assert.deepEqual(invoiceTotal(items, { discount: { type: 'percent', value: 10 }, taxRate: 0.08 }), {
    subtotal: 2999,
    discounted: 2699,
    tax: 216,
    total: 2915,
  });
});
