import assert from 'node:assert/strict';
import test from 'node:test';

import { weeklyTotal } from '../src/report.js';
import { weekStart } from '../src/week.js';

const entries = [
  { date: '2026-09-13', project: 'atlas', hours: 3 },
  { date: '2026-09-14', project: 'atlas', hours: 2.5 },
  { date: '2026-09-16', project: 'beacon', hours: 4 },
  { date: '2026-09-21', project: 'atlas', hours: 1 },
];

test('weekStart returns the Monday of the week', () => {
  assert.equal(weekStart('2026-09-14'), '2026-09-14');
  assert.equal(weekStart('2026-09-17'), '2026-09-14');
  assert.equal(weekStart('2026-09-20'), '2026-09-14');
});

test('weeklyTotal sums the entries of the selected week', () => {
  assert.deepEqual(weeklyTotal(entries, '2026-09-17'), { week: '2026-09-14', hours: 6.5 });
});
