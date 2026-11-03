import assert from 'node:assert/strict';
import test from 'node:test';

import { shippingCost } from '../src/rates.js';

test('domestic cost charges each started kilogram', () => {
  assert.equal(shippingCost({ zone: 'domestic', weightKg: 2.3 }), 7.8);
});

test('regional cost', () => {
  assert.equal(shippingCost({ zone: 'regional', weightKg: 2 }), 10.45);
});

test('international cost', () => {
  assert.equal(shippingCost({ zone: 'international', weightKg: 0.5 }), 18.4);
});

test('rejects unknown zones and empty parcels', () => {
  assert.throws(() => shippingCost({ zone: 'lunar', weightKg: 1 }), RangeError);
  assert.throws(() => shippingCost({ zone: 'domestic', weightKg: 0 }), RangeError);
});
