import assert from 'node:assert/strict';
import test from 'node:test';

import { lineTotal, orderTotal } from '../src/pricing.js';

test('prices a line as unit price times quantity', () => {
  assert.equal(lineTotal({ sku: 'A1', unitCents: 250, quantity: 3 }), 750);
});

test('sums line totals for an order', () => {
  const lines = [
    { sku: 'A1', unitCents: 250, quantity: 3 },
    { sku: 'B2', unitCents: 1000, quantity: 1 },
  ];
  assert.equal(orderTotal(lines), 1750);
});
