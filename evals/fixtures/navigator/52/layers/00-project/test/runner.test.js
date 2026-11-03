import assert from 'node:assert/strict';
import test from 'node:test';

import { runJobs } from '../src/runner.js';

const delay = (ms, value) => new Promise((resolve) => setTimeout(resolve, ms, value));

function cooperative(id, ms, value = id) {
  return {
    id,
    run: (signal) => new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms, value);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(signal.reason);
      }, { once: true });
    }),
  };
}

test('runs every job and keeps input order', async () => {
  const results = await runJobs([cooperative('a', 30), cooperative('b', 5), cooperative('c', 10)], { concurrency: 2 });
  assert.deepEqual(results.map((r) => [r.id, r.status, r.value]), [
    ['a', 'done', 'a'],
    ['b', 'done', 'b'],
    ['c', 'done', 'c'],
  ]);
});

test('retries a failing job up to the retry limit', async () => {
  let calls = 0;
  const job = {
    id: 'flaky',
    run: async () => {
      calls += 1;
      if (calls < 3) throw new Error('boom');
      return 'ok';
    },
  };
  const [result] = await runJobs([job], { retries: 2 });
  assert.equal(result.status, 'done');
  assert.equal(result.attempts, 3);
});

test('reports failed once retries are used up', async () => {
  const job = { id: 'broken', run: async () => { throw new Error('boom'); } };
  const [result] = await runJobs([job], { retries: 1 });
  assert.equal(result.status, 'failed');
  assert.equal(result.attempts, 2);
  assert.equal(result.error.message, 'boom');
});

test('a job that ignores its signal is reported as timed out', async () => {
  const job = { id: 'slow', run: () => delay(200, 'late') };
  const [result] = await runJobs([job], { timeoutMs: 20 });
  assert.equal(result.status, 'timeout');
  assert.equal(result.attempts, 1);
});

test('cancelling stops queued jobs from starting', async () => {
  const controller = new AbortController();
  const started = [];
  const job = (id) => ({
    id,
    run: (signal) => {
      started.push(id);
      return cooperative(id, 50).run(signal);
    },
  });
  setTimeout(() => controller.abort(), 10);
  const results = await runJobs([job('a'), job('b'), job('c')], { signal: controller.signal, concurrency: 1 });
  assert.deepEqual(started, ['a']);
  assert.deepEqual(results.map((r) => r.status), ['cancelled', 'cancelled', 'cancelled']);
  assert.equal(results[0].attempts, 1);
  assert.equal(results[0].abandoned, undefined);
  assert.equal(results[1].attempts, 0);
});

test('a job still running after the drain window is marked abandoned', async () => {
  const controller = new AbortController();
  const job = { id: 'stubborn', run: () => delay(300, 'late') };
  setTimeout(() => controller.abort(), 10);
  const [result] = await runJobs([job], { signal: controller.signal, drainMs: 50 });
  assert.equal(result.status, 'cancelled');
  assert.equal(result.abandoned, true);
});
