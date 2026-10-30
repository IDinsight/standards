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

test('filters by status', () => {
  assert.deepEqual(listTasks(tasks, { status: 'done' }).map((task) => task.id), [2]);
});

test('sorts by due date with undated tasks last', () => {
  assert.deepEqual(listTasks(tasks).map((task) => task.id), [5, 2, 1, 3, 4]);
});
