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

test('domestic order above the threshold ships free', () => {
  assert.equal(
    shippingCost({ zone: 'domestic', weightKg: 2.3, orderTotal: 60 }, { freeShippingThreshold: 50 }),
    0,
  );
});

test('order exactly at the threshold ships free', () => {
  assert.equal(
    shippingCost({ zone: 'regional', weightKg: 2, orderTotal: 50 }, { freeShippingThreshold: 50 }),
    0,
  );
});

test('order below the threshold is charged', () => {
  assert.equal(
    shippingCost({ zone: 'domestic', weightKg: 2.3, orderTotal: 49.99 }, { freeShippingThreshold: 50 }),
    7.8,
  );
});

test('international orders are always charged', () => {
  assert.equal(
    shippingCost({ zone: 'international', weightKg: 0.5, orderTotal: 200 }, { freeShippingThreshold: 50 }),
    18.4,
  );
});

test('rejects invalid thresholds', () => {
  for (const freeShippingThreshold of [-1, Number.NaN, Number.POSITIVE_INFINITY, '50']) {
    assert.throws(
      () => shippingCost({ zone: 'domestic', weightKg: 1, orderTotal: 10 }, { freeShippingThreshold }),
      RangeError,
    );
  }
});
