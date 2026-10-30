import assert from 'node:assert/strict';
import test from 'node:test';

import { computeTotals } from '../src/totals.js';

test('sums line items and adds tax', () => {
  const totals = computeTotals([
    { sku: 'A1', unitPrice: 1250, quantity: 2 },
    { sku: 'B2', unitPrice: 500, quantity: 1 },
  ]);
  assert.equal(totals.subtotal, 3000);
  assert.equal(totals.tax, 240);
  assert.equal(totals.total, 3240);
});

test('an empty cart totals zero', () => {
  const totals = computeTotals([]);
  assert.equal(totals.subtotal, 0);
  assert.equal(totals.total, 0);
});

test('rejects an invalid quantity', () => {
  assert.throws(() => computeTotals([{ sku: 'C3', unitPrice: 100, quantity: 0 }]), RangeError);
});
