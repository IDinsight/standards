import assert from 'node:assert/strict';
import test from 'node:test';

import { filterByDate, parseExpenses, totalsByCategory } from '../src/expenses.js';

const expenses = parseExpenses(
  'date,category,amount\n2026-02-28,travel,40.00\n2026-03-01,meals,12.00\n2026-03-31,travel,25.00\n2026-04-01,meals,9.00\n',
);
const dates = (list) => list.map((expense) => expense.date);

test('filterByDate includes both bounds of the range', () => {
  assert.deepEqual(dates(filterByDate(expenses, { from: '2026-03-01', to: '2026-03-31' })), ['2026-03-01', '2026-03-31']);
});

test('filterByDate with only from keeps expenses on or after the date', () => {
  assert.deepEqual(dates(filterByDate(expenses, { from: '2026-03-31' })), ['2026-03-31', '2026-04-01']);
});

test('filterByDate with only to keeps expenses on or before the date', () => {
  assert.deepEqual(dates(filterByDate(expenses, { to: '2026-02-28' })), ['2026-02-28']);
});

test('filterByDate without bounds keeps everything and totals use the filtered rows', () => {
  assert.equal(filterByDate(expenses).length, 4);
  assert.deepEqual(totalsByCategory(filterByDate(expenses, { from: '2026-03-01', to: '2026-03-31' })), [['meals', 12], ['travel', 25]]);
});
