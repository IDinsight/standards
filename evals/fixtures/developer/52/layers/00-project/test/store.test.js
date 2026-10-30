import assert from 'node:assert/strict';
import test from 'node:test';

import { addTask, completeTask, listTasks } from '../src/store.js';

test('addTask assigns the next id after the highest existing one', () => {
  const first = addTask([], 'Write report');
  assert.equal(first.task.id, 1);
  const second = addTask([{ id: 4, title: 'Old', done: true }], 'Call bank');
  assert.equal(second.task.id, 5);
  assert.equal(second.tasks.length, 2);
});

test('addTask trims the title and rejects an empty one', () => {
  assert.equal(addTask([], '  Pay rent  ').task.title, 'Pay rent');
  assert.throws(() => addTask([], '   '), /title is required/);
});

test('completeTask marks the task done and rejects unknown ids', () => {
  const { tasks } = addTask([], 'Water plants');
  assert.equal(completeTask(tasks, 1)[0].done, true);
  assert.equal(tasks[0].done, false);
  assert.throws(() => completeTask(tasks, 9), /no task 9/);
});

test('listTasks hides completed tasks unless includeDone is set', () => {
  const tasks = [
    { id: 1, title: 'A', done: false },
    { id: 2, title: 'B', done: true },
  ];
  assert.deepEqual(listTasks(tasks).map((task) => task.id), [1]);
  assert.deepEqual(listTasks(tasks, { includeDone: true }).map((task) => task.id), [1, 2]);
});
