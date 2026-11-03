import assert from 'node:assert/strict';
import test from 'node:test';

import { JobQueue } from '../src/queue.js';
import { drain } from '../src/worker.js';

test('drain runs every job and reports failures', async () => {
  const queue = new JobQueue();
  const ran = [];
  queue.enqueue({ name: 'a', priority: 5, run: () => { ran.push('a'); } });
  queue.enqueue({ name: 'b', priority: 1, run: () => { throw new Error('send failed'); } });
  const failures = [];
  const count = await drain(queue, { onError: (job) => failures.push(job.name) });
  assert.equal(count, 2);
  assert.deepEqual(ran, ['a']);
  assert.deepEqual(failures, ['b']);
  assert.equal(queue.size, 0);
});
