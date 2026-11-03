import assert from 'node:assert/strict';
import test from 'node:test';

import { formatCents } from '../src/format.js';
import { lineTotalCents, orderTotals } from '../src/totals.js';

test('line total multiplies unit price by quantity', () => {
  assert.equal(lineTotalCents({ unitPriceCents: 250, quantity: 4 }), 1000);
});

test('order totals round tax to the nearest cent', () => {
  const totals = orderTotals({ taxRate: 0.0825, items: [{ unitPriceCents: 1999, quantity: 1 }] });
  assert.deepEqual(totals, { subtotalCents: 1999, taxCents: 165, totalCents: 2164 });
});

test('formats cents as dollars', () => {
  assert.equal(formatCents(2164), '$21.64');
  assert.equal(formatCents(5), '$0.05');
});
