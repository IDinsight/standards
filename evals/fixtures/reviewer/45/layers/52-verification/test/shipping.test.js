import assert from 'node:assert/strict';
import test from 'node:test';

import { parseSettings } from '../src/settings.js';
import { shippingCost, subtotal } from '../src/shipping.js';

const settings = { baseRate: 4.5, perKg: 1.2 };
const order = (...items) => ({ items });

test('charges the base rate plus one started kilogram', () => {
  assert.equal(shippingCost(order({ unitPrice: 10, quantity: 2, weightKg: 0.4 }), settings), 5.7);
});

test('rounds the weight up to whole kilograms', () => {
  assert.equal(shippingCost(order({ unitPrice: 8, quantity: 5, weightKg: 0.5 }), settings), 8.1);
});

test('ships weightless orders for free', () => {
  assert.equal(shippingCost(order({ unitPrice: 15, quantity: 1, weightKg: 0 }), settings), 0);
});

test('sums line items into the subtotal', () => {
  const items = order({ unitPrice: 19.99, quantity: 3, weightKg: 0.2 }, { unitPrice: 5, quantity: 1, weightKg: 0.1 });
  assert.equal(subtotal(items), 64.97);
});

test('ships free when the subtotal equals the threshold', () => {
  const withThreshold = parseSettings({ freeShippingThreshold: 50 });
  assert.equal(shippingCost(order({ unitPrice: 25, quantity: 2, weightKg: 1.5 }), withThreshold), 0);
});

test('ships free when the subtotal is above the threshold', () => {
  const withThreshold = parseSettings({ freeShippingThreshold: 50 });
  assert.equal(shippingCost(order({ unitPrice: 40, quantity: 2, weightKg: 1.5 }), withThreshold), 0);
});

test('keeps the weight-based rate below the threshold', () => {
  const withThreshold = parseSettings({ freeShippingThreshold: 50 });
  assert.equal(shippingCost(order({ unitPrice: 49.99, quantity: 1, weightKg: 1.5 }), withThreshold), 6.9);
});

test('keeps the weight-based rate when no threshold is configured', () => {
  assert.equal(shippingCost(order({ unitPrice: 400, quantity: 1, weightKg: 1.5 }), parseSettings({})), 6.9);
});
