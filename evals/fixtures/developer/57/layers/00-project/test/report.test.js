import assert from 'node:assert/strict';
import test from 'node:test';

import { monthlyReport } from '../src/report.js';

const records = [
  { date: '2026-08-02', category: 'groceries', amountCents: 4520 },
  { date: '2026-08-15', category: 'transport', amountCents: 300 },
  { date: '2026-08-20', category: 'groceries', amountCents: 125000 },
  { date: '2026-07-30', category: 'groceries', amountCents: 999 },
];

test('monthlyReport totals each category for the month', () => {
  const lines = monthlyReport(records, '2026-08').split('\n');
  assert.equal(lines[0], 'Expenses for 2026-08');
  assert.match(lines[1], /^  groceries +1,295\.20$/);
  assert.match(lines[2], /^  transport +3\.00$/);
  assert.match(lines[3], /^  Total +1,298\.20$/);
  assert.equal(lines.length, 4);
});

test('monthlyReport right-aligns amounts', () => {
  const lines = monthlyReport(records, '2026-08').split('\n').slice(1);
  for (const line of lines) assert.equal(line.length, 28);
});
