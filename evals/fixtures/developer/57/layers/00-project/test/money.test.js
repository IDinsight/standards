import assert from 'node:assert/strict';
import test from 'node:test';

import { formatCents, toCents } from '../src/money.js';

test('toCents reads whole and fractional amounts', () => {
  assert.equal(toCents('12'), 1200);
  assert.equal(toCents('12.5'), 1250);
  assert.equal(toCents('0.07'), 7);
  assert.equal(toCents('-12'), -1200);
});

test('toCents rejects malformed amounts', () => {
  assert.throws(() => toCents('12.345'));
  assert.throws(() => toCents('abc'));
});

test('formatCents groups thousands', () => {
  assert.equal(formatCents(134275), '1,342.75');
  assert.equal(formatCents(5), '0.05');
  assert.equal(formatCents(-1200), '-12.00');
});
