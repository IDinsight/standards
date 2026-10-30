import assert from 'node:assert/strict';
import test from 'node:test';

import { quote, zones } from '../src/rates.js';

test('charges base rate plus each started kilogram', () => {
  const result = quote({ zone: 'domestic', weightKg: 2.3 });
  assert.deepEqual(result.lines, [
    { label: 'Base rate', amount: 590 },
    { label: 'Weight (3 kg)', amount: 255 },
  ]);
  assert.equal(result.total, 845);
});

test('uses the zone rate', () => {
  assert.equal(quote({ zone: 'international', weightKg: 1 }).total, 2060);
});

test('rejects unknown zones and non-positive weights', () => {
  assert.throws(() => quote({ zone: 'moon', weightKg: 1 }), RangeError);
  assert.throws(() => quote({ zone: 'domestic', weightKg: 0 }), RangeError);
});

test('lists the supported zones', () => {
  assert.deepEqual(zones, ['domestic', 'regional', 'international']);
});
