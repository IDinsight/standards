import assert from 'node:assert/strict';
import test from 'node:test';

import { backoffDelay, isRetryable, withRetry } from '../src/retry.js';

const noSleep = async () => {};

test('backoffDelay doubles per attempt and is capped', () => {
  assert.equal(backoffDelay(0), 100);
  assert.equal(backoffDelay(1), 200);
  assert.equal(backoffDelay(10), 2000);
});

test('only transient statuses are retryable', () => {
  assert.equal(isRetryable(503), true);
  assert.equal(isRetryable(429), true);
  assert.equal(isRetryable(404), false);
  assert.equal(isRetryable(200), false);
});

test('client errors are returned without retrying', async () => {
  let calls = 0;
  const response = await withRetry(async () => { calls += 1; return { status: 404 }; }, { sleep: noSleep });
  assert.equal(response.status, 404);
  assert.equal(calls, 1);
});

test('server errors are retried until attempts run out', async () => {
  let calls = 0;
  const response = await withRetry(async () => { calls += 1; return { status: 503 }; }, { sleep: noSleep });
  assert.equal(response.status, 503);
  assert.equal(calls, 3);
});

test('returns the first successful response', async () => {
  const statuses = [502, 200];
  const response = await withRetry(async () => ({ status: statuses.shift() }), { sleep: noSleep });
  assert.equal(response.status, 200);
});
