import assert from 'node:assert/strict';
import test from 'node:test';

import { formatCents } from '../src/money.js';

test('formats cents with two fractional digits', () => {
  assert.equal(formatCents(1999), '19.99');
  assert.equal(formatCents(500), '5.00');
  assert.equal(formatCents(-250), '-2.50');
});

test('rejects non-integer amounts', () => {
  assert.throws(() => formatCents(19.99), TypeError);
});
