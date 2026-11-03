import assert from 'node:assert/strict';
import test from 'node:test';

import { RetryError, backoffDelay, retry } from '../src/retry.js';

function recorder() {
  const waits = [];
  return { waits, wait: async (ms) => { waits.push(ms); } };
}

const options = { attempts: 3, baseDelayMs: 10, maxDelayMs: 100 };

test('returns the first successful result', async () => {
  const { waits, wait } = recorder();
  let calls = 0;
  const result = await retry(async () => {
    calls += 1;
    if (calls < 2) throw new Error('flaky');
    return 'ok';
  }, { ...options, wait });
  assert.equal(result, 'ok');
  assert.equal(calls, 2);
  assert.deepEqual(waits, [10]);
});

test('gives up with RetryError after the configured attempts', async () => {
  const { waits, wait } = recorder();
  let calls = 0;
  const failure = new Error('down');
  await assert.rejects(retry(async () => {
    calls += 1;
    throw failure;
  }, { ...options, wait }), (error) => error instanceof RetryError && error.attempts === 3 && error.cause === failure);
  assert.equal(calls, 3);
  assert.deepEqual(waits, [10, 20]);
});

test('rethrows errors marked not retryable', async () => {
  const { waits, wait } = recorder();
  let calls = 0;
  const rejected = Object.assign(new Error('bad request'), { retryable: false });
  await assert.rejects(retry(async () => {
    calls += 1;
    throw rejected;
  }, { ...options, wait }), (error) => error === rejected);
  assert.equal(calls, 1);
  assert.deepEqual(waits, []);
});

test('doubles the delay up to the cap', () => {
  const limits = { baseDelayMs: 100, maxDelayMs: 250 };
  assert.equal(backoffDelay(1, limits), 100);
  assert.equal(backoffDelay(2, limits), 200);
  assert.equal(backoffDelay(3, limits), 250);
  assert.equal(backoffDelay(6, limits), 250);
});
