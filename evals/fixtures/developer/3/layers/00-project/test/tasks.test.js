import assert from 'node:assert/strict';
import test from 'node:test';

import { ValidationError, completeTask, createTask } from '../src/tasks.js';

test('createTask trims the title and defaults priority to normal', () => {
  const task = createTask({ id: 1, title: '  Write release notes ' });
  assert.equal(task.id, 1);
  assert.equal(task.title, 'Write release notes');
  assert.equal(task.priority, 'normal');
  assert.equal(task.done, false);
});

test('createTask rejects a blank title', () => {
  assert.throws(() => createTask({ id: 2, title: '   ' }), ValidationError);
});

test('createTask rejects an unknown priority', () => {
  assert.throws(() => createTask({ id: 3, title: 'Plan sprint', priority: 'urgent' }), ValidationError);
});

test('createTask rejects a missing or non-positive id', () => {
  assert.throws(() => createTask({ title: 'Plan sprint' }), ValidationError);
  assert.throws(() => createTask({ id: 0, title: 'Plan sprint' }), ValidationError);
});

test('completeTask marks a copy as done', () => {
  const task = createTask({ id: 4, title: 'Ship', priority: 'high' });
  const finished = completeTask(task);
  assert.equal(finished.done, true);
  assert.equal(finished.priority, 'high');
  assert.equal(task.done, false);
});
