import assert from 'node:assert/strict';
import test from 'node:test';

import { formatTask, parseTasks, summarize } from '../src/tasks.js';

test('parseTasks fills defaults', () => {
  assert.deepEqual(parseTasks('[{"title": " Water plants "}]'), [
    { title: 'Water plants', priority: 'normal', due: null, done: false },
  ]);
});

test('parseTasks rejects a task without a title', () => {
  assert.throws(() => parseTasks('[{"due": "2026-10-01"}]'), /task 1 needs a title/);
});

test('parseTasks rejects an unknown priority', () => {
  assert.throws(() => parseTasks('[{"title": "x", "priority": "urgent"}]'), /unknown priority/);
});

test('formatTask shows status, due date, and high priority', () => {
  assert.equal(formatTask({ title: 'Renew passport', priority: 'high', due: '2026-10-15', done: false }),
    '[ ] Renew passport (due 2026-10-15) !');
  assert.equal(formatTask({ title: 'Pay bill', priority: 'normal', due: null, done: true }), '[x] Pay bill');
});

test('summarize counts open and done tasks', () => {
  const tasks = parseTasks('[{"title": "a"}, {"title": "b", "done": true}, {"title": "c"}]');
  assert.equal(summarize(tasks), '2 open, 1 done');
});
