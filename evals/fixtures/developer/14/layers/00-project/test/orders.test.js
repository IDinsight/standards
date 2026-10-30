import assert from 'node:assert/strict';
import test from 'node:test';

import { formatCents } from '../src/format.js';
import { parseOrders, summarize, toCents } from '../src/orders.js';

const sample = 'id,customer,amount,date\n1,Acme Ltd,12.5,2026-08-01\n2,Birch & Co,3,2026-08-02\n';

test('toCents reads whole and fractional amounts', () => {
  assert.equal(toCents('12.5'), 1250);
  assert.equal(toCents('3'), 300);
  assert.equal(toCents('0.07'), 7);
  assert.throws(() => toCents('1.234'));
});

test('parseOrders maps columns and skips blank lines', () => {
  assert.deepEqual(parseOrders(sample + '\n'), [
    { id: '1', customer: 'Acme Ltd', amountCents: 1250, date: '2026-08-01' },
    { id: '2', customer: 'Birch & Co', amountCents: 300, date: '2026-08-02' },
  ]);
});

test('summarize counts orders and adds amounts', () => {
  assert.deepEqual(summarize(parseOrders(sample)), { count: 2, totalCents: 1550 });
});

test('formatCents always shows two decimals', () => {
  assert.equal(formatCents(1550), '15.50');
  assert.equal(formatCents(7), '0.07');
  assert.equal(formatCents(0), '0.00');
});
