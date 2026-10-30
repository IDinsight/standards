import assert from 'node:assert/strict';
import test from 'node:test';

import { nightlyReport, passwordResetEmail } from '../src/jobs.js';
import { JobQueue } from '../src/queue.js';

test('higher priority jobs are dequeued first', () => {
  const queue = new JobQueue();
  queue.enqueue(nightlyReport(() => {}));
  queue.enqueue(passwordResetEmail('ada@example.org', () => {}));
  assert.equal(queue.dequeue().name, 'password-reset-email');
  assert.equal(queue.dequeue().name, 'nightly-report');
});

test('dequeue on an empty queue returns undefined', () => {
  assert.equal(new JobQueue().dequeue(), undefined);
});

test('enqueue rejects jobs without a run function', () => {
  assert.throws(() => new JobQueue().enqueue({ name: 'x', priority: 1 }), TypeError);
});
