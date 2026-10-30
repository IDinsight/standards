import assert from 'node:assert/strict';
import test from 'node:test';

import { JobQueue } from '../src/queue.js';

test('drain runs handlers and retries a failing job', async () => {
  const queue = new JobQueue();
  let calls = 0;
  queue.enqueue('flaky', {});
  const failed = await queue.drain({
    flaky: async () => {
      calls += 1;
      if (calls < 2) throw new Error('try again');
    },
  });
  assert.equal(calls, 2);
  assert.deepEqual(failed, []);
  assert.equal(queue.size(), 0);
});

test('jobs without a handler are returned', async () => {
  const queue = new JobQueue();
  queue.enqueue('unknown', { id: 1 });
  const failed = await queue.drain({});
  assert.equal(failed.length, 1);
  assert.equal(failed[0].name, 'unknown');
});
