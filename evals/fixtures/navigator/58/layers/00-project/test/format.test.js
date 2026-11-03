import assert from 'node:assert/strict';
import test from 'node:test';

import { formatCents } from '../src/format.js';

test('formats cents as a decimal string', () => {
  assert.equal(formatCents(2915), '29.15');
  assert.equal(formatCents(5), '0.05');
  assert.equal(formatCents(-120), '-1.20');
});
