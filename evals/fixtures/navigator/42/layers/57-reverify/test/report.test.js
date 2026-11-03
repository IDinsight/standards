import assert from 'node:assert/strict';
import test from 'node:test';

import { projectTotals, weeklyTotal } from '../src/report.js';
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

const week = [
  { date: '2026-09-13', project: 'atlas', hours: 3 },
  { date: '2026-09-14', project: 'atlas', hours: 2.5 },
  { date: '2026-09-15', project: 'beacon', hours: 1.25 },
  { date: '2026-09-16', project: 'beacon', hours: 4 },
  { date: '2026-09-17', project: 'atlas', hours: 1.333 },
  { date: '2026-09-21', project: 'atlas', hours: 1 },
];

test('projectTotals lists hours per project, largest first', () => {
  assert.deepEqual(projectTotals(week, '2026-09-16'), [
    { project: 'beacon', hours: 5.25 },
    { project: 'atlas', hours: 3.83 },
  ]);
});

test('projectTotals orders projects with equal hours by name', () => {
  const tied = [
    { date: '2026-09-15', project: 'delta', hours: 2 },
    { date: '2026-09-15', project: 'cobalt', hours: 2 },
  ];
  assert.deepEqual(projectTotals(tied, '2026-09-15'), [
    { project: 'cobalt', hours: 2 },
    { project: 'delta', hours: 2 },
  ]);
});

test('projectTotals ignores entries from neighbouring weeks', () => {
  assert.deepEqual(projectTotals(week, '2026-09-21'), [{ project: 'atlas', hours: 1 }]);
});

test('projectTotals includes entries dated on the Sunday that ends the week', () => {
  const withSunday = [...week, { date: '2026-09-20', project: 'cobalt', hours: 2 }];
  assert.deepEqual(projectTotals(withSunday, '2026-09-16'), [
    { project: 'beacon', hours: 5.25 },
    { project: 'atlas', hours: 3.83 },
    { project: 'cobalt', hours: 2 },
  ]);
});
