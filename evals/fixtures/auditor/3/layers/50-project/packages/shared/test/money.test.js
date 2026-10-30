import assert from 'node:assert/strict';
import test from 'node:test';

import { formatCents, sumCents, toCents } from '../src/index.js';

test('toCents converts decimal amounts', () => {
  assert.equal(toCents('19.99'), 1999);
  assert.equal(toCents(5), 500);
});

test('formatCents renders an amount with its currency', () => {
  assert.equal(formatCents(123456), 'USD 1234.56');
  assert.equal(formatCents(-5, 'EUR'), '-EUR 0.05');
});

test('sumCents adds integer cents', () => {
  assert.equal(sumCents([100, 250, -50]), 300);
});
