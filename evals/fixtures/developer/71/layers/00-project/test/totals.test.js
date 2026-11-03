import assert from 'node:assert/strict';
import test from 'node:test';

import { renderInvoice } from '../src/format.js';
import { computeTotals, lineTotal } from '../src/totals.js';

const lines = [
  { description: 'Widget', quantity: 3, unitPriceCents: 1250 },
  { description: 'Cable', quantity: 1, unitPriceCents: 499 },
];

test('lineTotal multiplies quantity by unit price', () => {
  assert.equal(lineTotal(lines[0]), 3750);
});

test('computeTotals adds tax to the subtotal', () => {
  const totals = computeTotals(lines, { taxRate: 0.08 });
  assert.equal(totals.subtotal, 4249);
  assert.equal(totals.tax, 340);
  assert.equal(totals.total, 4589);
});

test('renderInvoice prints lines and totals', () => {
  const text = renderInvoice({ lines, taxRate: 0.08 });
  assert.equal(
    text,
    [
      'Widget  3 x 12.50',
      'Cable  1 x 4.99',
      'Subtotal  42.49',
      'Tax  3.40',
      'Total  45.89',
    ].join('\n'),
  );
});
