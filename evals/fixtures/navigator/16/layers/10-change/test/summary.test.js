import assert from 'node:assert/strict';
import test from 'node:test';

import { summarize } from '../src/summary.js';

test('totals are shown with two decimal places', () => {
  const out = summarize([
    { id: '1', customer: 'Acme', amount: 0.1 },
    { id: '2', customer: 'Acme', amount: 0.2 },
  ]);
  assert.equal(out, 'Acme: 0.30\nTotal: 0.30');
});

test('customers are listed alphabetically with subtotals', () => {
  const out = summarize([
    { id: '1', customer: 'Zeta', amount: 50 },
    { id: '2', customer: 'Acme', amount: 100 },
  ]);
  assert.equal(out, 'Acme: 100.00\nZeta: 50.00\nTotal: 150.00');
});

test('empty input shows a zero total', () => {
  assert.equal(summarize([]), 'Total: 0.00');
});
