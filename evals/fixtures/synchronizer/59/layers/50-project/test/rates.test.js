import assert from 'node:assert/strict';
import test from 'node:test';

import { quote, zones } from '../src/rates.js';

test('domestic quote for whole kilograms', () => {
  assert.equal(quote(2, 'domestic'), 6.9);
});

test('billable weight rounds up to the next half kilogram', () => {
  assert.equal(quote(1.2, 'domestic'), 6.3);
  assert.equal(quote(0.3, 'international'), 17.38);
});

test('rejects unknown zones', () => {
  assert.throws(() => quote(1, 'lunar'), /unknown zone: lunar/);
});

test('rejects non-positive weights', () => {
  assert.throws(() => quote(0, 'domestic'), /weight must be positive/);
});

test('lists zones', () => {
  assert.deepEqual(zones(), ['domestic', 'regional', 'international']);
});
