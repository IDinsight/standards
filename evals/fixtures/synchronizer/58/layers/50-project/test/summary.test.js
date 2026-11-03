import assert from 'node:assert/strict';
import test from 'node:test';

import { formatCents, monthSummary } from '../src/summary.js';

const entries = [
  { date: '2026-08-01', description: 'Salary', amount: 240000 },
  { date: '2026-08-03', description: 'Rent', amount: -95000 },
  { date: '2026-09-01', description: 'Salary', amount: 240000 },
];

test('totals one month', () => {
  assert.deepEqual(monthSummary(entries, '2026-08'), {
    month: '2026-08', count: 2, income: 240000, spending: 95000, net: 145000,
  });
});

test('rejects an invalid month', () => {
  assert.throws(() => monthSummary(entries, '2026-13'), RangeError);
});

test('formats cents', () => {
  assert.equal(formatCents(138275), '1382.75');
  assert.equal(formatCents(-5), '-0.05');
});
