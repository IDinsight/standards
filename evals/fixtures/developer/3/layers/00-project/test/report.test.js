import assert from 'node:assert/strict';
import test from 'node:test';

import { listOpen, summarize } from '../src/report.js';
import { completeTask, createTask } from '../src/tasks.js';

const tasks = () => [
  createTask({ id: 1, title: 'Low one', priority: 'low' }),
  completeTask(createTask({ id: 2, title: 'Done one', priority: 'high' })),
  createTask({ id: 3, title: 'High one', priority: 'high' }),
  createTask({ id: 4, title: 'Normal one' }),
];

test('summarize counts open and done tasks', () => {
  assert.deepEqual(summarize(tasks()), { total: 4, open: 3, done: 1 });
});

test('listOpen orders open tasks by priority, then id', () => {
  assert.deepEqual(listOpen(tasks()).map((task) => task.id), [3, 4, 1]);
});

test('listOpen leaves its input in place', () => {
  const input = tasks();
  listOpen(input);
  assert.deepEqual(input.map((task) => task.id), [1, 2, 3, 4]);
});
