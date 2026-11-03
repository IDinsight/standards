import assert from 'node:assert/strict';
import test from 'node:test';

import { formatAmount } from '../src/format.js';

test('formats whole and fractional cents', () => {
  assert.equal(formatAmount(1250), '$12.50');
  assert.equal(formatAmount(5), '$0.05');
});

test('groups thousands', () => {
  assert.equal(formatAmount(123456789), '$1,234,567.89');
});

test('uses the given currency symbol', () => {
  assert.equal(formatAmount(999, '€'), '€9.99');
});
