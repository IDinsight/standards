import assert from 'node:assert/strict';
import test from 'node:test';

import { formatCents, roundCents, toCents } from '../src/money.js';

test('toCents parses whole and fractional amounts', () => {
  assert.equal(toCents('12'), 1200);
  assert.equal(toCents('12.5'), 1250);
  assert.equal(toCents('0.07'), 7);
});

test('toCents rejects malformed amounts', () => {
  assert.throws(() => toCents('1.234'), TypeError);
  assert.throws(() => toCents('-3'), TypeError);
  assert.throws(() => toCents(4), TypeError);
});

test('formatCents renders two decimals', () => {
  assert.equal(formatCents(1205), '12.05');
  assert.equal(formatCents(-50), '-0.50');
});

test('roundCents rounds halves away from zero', () => {
  assert.equal(roundCents(2.5), 3);
  assert.equal(roundCents(-2.5), -3);
  assert.equal(roundCents(2.49), 2);
});
