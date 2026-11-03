import assert from 'node:assert/strict';
import test from 'node:test';

import { TaskStore } from '../src/store.js';
import { getTask, listTasks } from '../src/tasks.js';

test('adds tasks with sequential ids and defaults', () => {
  const store = new TaskStore();
  const first = store.add({ title: 'Plan sprint' });
  const second = store.add({ title: 'Book room', status: 'in_progress', assignee: 'u2', due: '2026-10-02' });
  assert.deepEqual(first, { id: 1, title: 'Plan sprint', status: 'open', assignee: null, due: null });
  assert.equal(second.id, 2);
});

test('rejects an unknown status', () => {
  const store = new TaskStore();
  assert.throws(() => store.add({ title: 'x', status: 'blocked' }), /unknown status/);
});

test('getTask returns 404 for a missing id', () => {
  const result = getTask(new TaskStore(), '7');
  assert.deepEqual(result, { status: 404, body: { error: 'not found' } });
});

test('listTasks returns every task', () => {
  const store = new TaskStore([{ title: 'a' }, { title: 'b', status: 'done' }]);
  const result = listTasks(store);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.tasks.map((task) => task.title), ['a', 'b']);
});
