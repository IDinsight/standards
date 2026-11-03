import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { run } from '../src/cli.js';
import { addTask, completeTask, formatTask, openTasks } from '../src/tasks.js';

test('addTask assigns increasing ids and trims titles', () => {
  const now = new Date('2026-09-01T10:00:00Z');
  const tasks = addTask(addTask([], ' Buy milk ', now), 'Call Sam', now);
  assert.deepEqual(tasks.map((task) => [task.id, task.title]), [[1, 'Buy milk'], [2, 'Call Sam']]);
  assert.equal(tasks[0].createdAt, '2026-09-01T10:00:00.000Z');
});

test('addTask rejects an empty title', () => {
  assert.throws(() => addTask([], '   '), /title is required/);
});

test('completeTask marks one task done and openTasks hides it', () => {
  const tasks = completeTask(addTask(addTask([], 'a'), 'b'), 1);
  assert.deepEqual(openTasks(tasks).map((task) => task.id), [2]);
  assert.equal(formatTask(tasks[0]), '[x] 1. a');
});

test('completeTask rejects an unknown id', () => {
  assert.throws(() => completeTask([], 4), /no task 4/);
});

test('cli adds, completes, and lists tasks in a file', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'tasklog-'));
  const file = path.join(dir, 'tasks.json');
  try {
    assert.equal(run(['add', 'Buy', 'milk'], file), 'added 1');
    assert.equal(run(['add', 'Call', 'Sam'], file), 'added 2');
    assert.equal(run(['done', '1'], file), 'completed 1');
    assert.equal(run(['list'], file), '[ ] 2. Call Sam');
    assert.equal(run(['list', '--all'], file), '[x] 1. Buy milk\n[ ] 2. Call Sam');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
