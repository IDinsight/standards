import assert from 'node:assert/strict';
import test from 'node:test';

import { parseExpenses, totalsByCategory } from '../src/expenses.js';

const csv = 'date,category,amount\n2026-02-27,travel,120.50\n2026-03-02,meals,18.20\n2026-03-15,travel,64.00\n';

test('parseExpenses reads date, category, and amount', () => {
  assert.deepEqual(parseExpenses(csv)[0], { date: '2026-02-27', category: 'travel', amount: 120.5 });
});

test('parseExpenses rejects a non-numeric amount', () => {
  assert.throws(() => parseExpenses('date,category,amount\n2026-03-01,meals,abc\n'), /Line 2: invalid amount abc/);
});

test('totalsByCategory sums amounts per category in name order', () => {
  assert.deepEqual(totalsByCategory(parseExpenses(csv)), [['meals', 18.2], ['travel', 184.5]]);
});
