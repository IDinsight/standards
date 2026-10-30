import assert from 'node:assert/strict';
import test from 'node:test';

import { MemoryQueue } from '../src/queue.js';
import { Worker } from '../src/worker.js';

const quiet = { info() {}, warn() {} };

function setup(handler, options = {}) {
  let now = 0;
  const queue = new MemoryQueue();
  const worker = new Worker({
    queue, handlers: { echo: handler }, baseDelayMs: 10, clock: () => now, log: quiet, ...options,
  });
  return { queue, worker, advance: (ms) => { now += ms; } };
}

test('runs the handler for a ready job', async () => {
  const seen = [];
  const { queue, worker } = setup(async (payload) => { seen.push(payload); });
  queue.push({ id: 1, type: 'echo', payload: 'hi' });
  assert.equal(await worker.drain(), 1);
  assert.deepEqual(seen, ['hi']);
  assert.equal(queue.size, 0);
});

test('retries a failed job after a delay', async () => {
  let calls = 0;
  const { queue, worker, advance } = setup(async () => {
    calls += 1;
    if (calls === 1) throw new Error('temporary');
  });
  queue.push({ id: 2, type: 'echo', payload: null });
  assert.equal(await worker.runOnce(), true);
  assert.equal(await worker.runOnce(), false);
  advance(10);
  assert.equal(await worker.runOnce(), true);
  assert.equal(calls, 2);
  assert.equal(queue.dead.length, 0);
});

test('buries a job after maxAttempts failures', async () => {
  const { queue, worker, advance } = setup(async () => { throw new Error('down'); });
  queue.push({ id: 3, type: 'echo', payload: null });
  for (let i = 0; i < 3; i += 1) {
    assert.equal(await worker.runOnce(), true);
    advance(1000);
  }
  assert.equal(queue.size, 0);
  assert.equal(queue.dead.length, 1);
  assert.equal(queue.dead[0].job.attempts, 3);
  assert.equal(queue.dead[0].error, 'down');
});

test('buries a job with no handler', async () => {
  const { queue, worker } = setup(async () => {});
  queue.push({ id: 4, type: 'unknown', payload: null });
  await worker.drain();
  assert.equal(queue.dead.length, 1);
  assert.match(queue.dead[0].error, /no handler/);
});
