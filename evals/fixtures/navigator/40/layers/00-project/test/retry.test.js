import assert from 'node:assert/strict';
import test from 'node:test';

import { isRetryable, withRetry } from '../src/retry.js';

const noWait = async () => {};

test('returns the first successful result', async () => {
  let calls = 0;
  const result = await withRetry(async () => { calls += 1; return 'ok'; }, { sleepFn: noWait });
  assert.equal(result, 'ok');
  assert.equal(calls, 1);
});

test('retries a failing operation until it succeeds', async () => {
  let calls = 0;
  const result = await withRetry(async () => {
    calls += 1;
    if (calls < 3) throw new Error('connection reset');
    return 'ok';
  }, { sleepFn: noWait });
  assert.equal(result, 'ok');
  assert.equal(calls, 3);
});

test('does not retry client errors', async () => {
  let calls = 0;
  const notFound = Object.assign(new Error('not found'), { status: 404 });
  await assert.rejects(withRetry(async () => { calls += 1; throw notFound; }, { sleepFn: noWait }), notFound);
  assert.equal(calls, 1);
});

test('throws the last error when every attempt fails', async () => {
  await assert.rejects(
    withRetry(async () => { throw new Error('connection reset'); }, { sleepFn: noWait }),
    /connection reset/,
  );
});

test('classifies statuses', () => {
  assert.equal(isRetryable({ status: 503 }), true);
  assert.equal(isRetryable({ status: 429 }), true);
  assert.equal(isRetryable({ status: 400 }), false);
  assert.equal(isRetryable(new Error('socket hang up')), true);
});
