import assert from 'node:assert/strict';
import test from 'node:test';

import { TaskValidationError } from '../src/errors.js';
import { TaskStore } from '../src/store.js';
import { createTask, listTasks, updateTask } from '../src/tasks.js';

test('createTask trims the title and defaults status to open', () => {
  const store = new TaskStore();
  const task = createTask(store, { title: '  Buy milk ' });
  assert.equal(task.id, 1);
  assert.equal(task.title, 'Buy milk');
  assert.equal(task.status, 'open');
});

test('createTask rejects an empty title', () => {
  assert.throws(() => createTask(new TaskStore(), { title: '   ' }), TaskValidationError);
});

test('updateTask changes status and keeps the title', () => {
  const store = new TaskStore();
  const { id } = createTask(store, { title: 'Write report' });
  const updated = updateTask(store, id, { status: 'done' });
  assert.equal(updated.status, 'done');
  assert.equal(updated.title, 'Write report');
});

test('updateTask returns null for an unknown id', () => {
  assert.equal(updateTask(new TaskStore(), 99, { status: 'done' }), null);
});

test('listTasks filters by status', () => {
  const store = new TaskStore();
  createTask(store, { title: 'a' });
  createTask(store, { title: 'b', status: 'done' });
  createTask(store, { title: 'c' });
  assert.deepEqual(listTasks(store, { status: 'open' }).map((task) => task.title), ['a', 'c']);
});
