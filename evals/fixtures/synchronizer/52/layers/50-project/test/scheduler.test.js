import assert from 'node:assert/strict';
import test from 'node:test';

import { dueJobs } from '../src/scheduler.js';

test('lists jobs due at an elapsed time', () => {
  const jobs = [{ name: 'a', intervalSeconds: 60 }, { name: 'b', intervalSeconds: 90 }];
  assert.deepEqual(dueJobs(jobs, 180), ['a', 'b']);
  assert.deepEqual(dueJobs(jobs, 120), ['a']);
});
