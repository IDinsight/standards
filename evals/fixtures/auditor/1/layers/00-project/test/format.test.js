import assert from 'node:assert/strict';
import test from 'node:test';

import { formatCents } from '../src/format.js';

test('formats whole and fractional amounts', () => {
  assert.equal(formatCents(1250), '12.50');
  assert.equal(formatCents(5), '0.05');
  assert.equal(formatCents(0), '0.00');
});

test('formats negative amounts', () => {
  assert.equal(formatCents(-199), '-1.99');
});
