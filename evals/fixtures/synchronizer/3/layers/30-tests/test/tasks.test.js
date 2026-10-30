import assert from 'node:assert/strict';
import test from 'node:test';

import { listTasks } from '../src/tasks.js';

const tasks = [
  { id: 1, title: 'File expenses', status: 'open', due: '2026-09-20' },
  { id: 2, title: 'Renew domain', status: 'done', due: '2026-09-18' },
  { id: 3, title: 'Plan offsite', status: 'open', due: '2026-10-02' },
  { id: 4, title: 'Read RFC draft', status: 'open' },
  { id: 5, title: 'Call landlord', status: 'open', due: '2026-09-15' },
];

const now = new Date('2026-09-24T09:00:00Z');

test('filters by status', () => {
  assert.deepEqual(listTasks(tasks, { status: 'done' }).map((task) => task.id), [2]);
});

test('sorts by due date with undated tasks last', () => {
  assert.deepEqual(listTasks(tasks).map((task) => task.id), [5, 2, 1, 3, 4]);
});

test('overdue returns open tasks due before today', () => {
  assert.deepEqual(listTasks(tasks, { overdue: true, now }).map((task) => task.id), [5, 1]);
});

test('overdue skips tasks without a due date', () => {
  const result = listTasks(tasks, { overdue: true, now });
  assert.ok(result.every((task) => task.due));
});

test('overdue treats a task due today as not overdue', () => {
  const today = [{ id: 6, title: 'Submit report', status: 'open', due: '2026-09-24' }];
  assert.deepEqual(listTasks(today, { overdue: true, now }), []);
});
