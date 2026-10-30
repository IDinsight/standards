import assert from 'node:assert/strict';
import test from 'node:test';

import { formatCents } from '../src/money.js';
import { invoiceTotals, lineTotal } from '../src/totals.js';

test('totals apply discount before tax', () => {
  const totals = invoiceTotals({
    discountCents: 500,
    taxBasisPoints: 825,
    lines: [
      { sku: 'A-100', quantity: 2, unitCents: 1250 },
      { sku: 'B-220', quantity: 1, unitCents: 999 },
    ],
  });
  assert.deepEqual(totals, { subtotal: 3499, discount: 500, tax: 247, total: 3246 });
});

test('discount is capped at the subtotal', () => {
  const totals = invoiceTotals({ discountCents: 1000, lines: [{ sku: 'C-1', quantity: 1, unitCents: 300 }] });
  assert.deepEqual(totals, { subtotal: 300, discount: 300, tax: 0, total: 0 });
});

test('rejects a zero quantity', () => {
  assert.throws(() => lineTotal({ sku: 'D-9', quantity: 0, unitCents: 100 }), RangeError);
});

test('formats cents with currency', () => {
  assert.equal(formatCents(3246), 'USD 32.46');
  assert.equal(formatCents(-5, 'EUR'), '-EUR 0.05');
});
