import assert from 'node:assert/strict';
import test from 'node:test';

import { TaskStore } from '../src/store.js';
import { listTasks } from '../src/tasks.js';

function seeded() {
  return new TaskStore([
    { title: 'Write release notes', status: 'open', assignee: 'u1', due: '2026-10-01' },
    { title: 'Fix login redirect', status: 'in_progress', assignee: 'u2', due: '2026-10-03' },
    { title: 'Archive old boards', status: 'done', assignee: 'u1', due: null },
    { title: 'Review contributor guide', status: 'open', assignee: null, due: '2026-10-05' },
  ]);
}

const titles = (result) => result.body.tasks.map((task) => task.title);

test('status filter returns only matching tasks', () => {
  const result = listTasks(seeded(), { status: 'open' });
  assert.equal(result.status, 200);
  assert.deepEqual(titles(result), ['Write release notes', 'Review contributor guide']);
});

test("assignee filter returns only that user's tasks", () => {
  const result = listTasks(seeded(), { assignee: 'u1' });
  assert.equal(result.status, 200);
  assert.deepEqual(titles(result), ['Write release notes', 'Archive old boards']);
});

test('status and assignee filters combine', () => {
  const result = listTasks(seeded(), { status: 'done', assignee: 'u1' });
  assert.deepEqual(titles(result), ['Archive old boards']);
});

test('due range includes both end dates', () => {
  const result = listTasks(seeded(), { due_from: '2026-10-01', due_to: '2026-10-03' });
  assert.deepEqual(titles(result), ['Write release notes', 'Fix login redirect']);
});

test('due_from alone excludes earlier and undated tasks', () => {
  const result = listTasks(seeded(), { due_from: '2026-10-02' });
  assert.deepEqual(titles(result), ['Fix login redirect', 'Review contributor guide']);
});
