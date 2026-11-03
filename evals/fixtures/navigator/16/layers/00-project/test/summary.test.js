import assert from 'node:assert/strict';
import test from 'node:test';

import { summarize } from '../src/summary.js';

test('customers are listed alphabetically with subtotals', () => {
  const out = summarize([
    { id: '1', customer: 'Zeta', amount: 50 },
    { id: '2', customer: 'Acme', amount: 100 },
  ]);
  assert.equal(out, 'Acme: 100\nZeta: 50\nTotal: 150');
});

test('empty input shows a zero total', () => {
  assert.equal(summarize([]), 'Total: 0');
});
