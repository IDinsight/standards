import assert from 'node:assert/strict';
import test from 'node:test';

import { DiscountError, lookupDiscount } from '../src/discounts.js';

test('codes match regardless of case and surrounding spaces', () => {
  assert.equal(lookupDiscount(' spring10 ', '2026-09-01'), 10);
});

test('a code is rejected after its expiry date', () => {
  assert.throws(
    () => lookupDiscount('SPRING10', '2027-01-01'),
    (error) => error instanceof DiscountError && /SPRING10/.test(error.message) && /expired/.test(error.message),
  );
});
