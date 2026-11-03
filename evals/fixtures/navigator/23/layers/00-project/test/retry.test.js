import assert from 'node:assert/strict';
import test from 'node:test';

import { RETRY_LIMIT, isRetryable, withRetry } from '../src/retry.js';

const noWait = async () => {};

test('returns the first successful result', async () => {
  let calls = 0;
  const result = await withRetry(async () => {
    calls += 1;
    if (calls < 2) throw Object.assign(new Error('busy'), { status: 503 });
    return 'ok';
  }, { wait: noWait });
  assert.equal(result, 'ok');
  assert.equal(calls, 2);
});

test('gives up after the default number of retries', async () => {
  let calls = 0;
  await assert.rejects(withRetry(async () => {
    calls += 1;
    throw Object.assign(new Error('down'), { status: 500 });
  }, { wait: noWait }), /down/);
  assert.equal(calls, RETRY_LIMIT + 1);
});

test('does not retry client errors', async () => {
  let calls = 0;
  await assert.rejects(withRetry(async () => {
    calls += 1;
    throw Object.assign(new Error('missing'), { status: 404 });
  }, { limit: 3, wait: noWait }), /missing/);
  assert.equal(calls, 1);
});

test('backs off exponentially', async () => {
  const delays = [];
  await assert.rejects(withRetry(async () => {
    throw Object.assign(new Error('down'), { retryable: true });
  }, { limit: 3, baseDelayMs: 10, wait: async (ms) => { delays.push(ms); } }));
  assert.deepEqual(delays, [10, 20, 40]);
});

test('classifies retryable errors', () => {
  assert.equal(isRetryable({ status: 502 }), true);
  assert.equal(isRetryable({ retryable: true }), true);
  assert.equal(isRetryable({ status: 400 }), false);
  assert.equal(isRetryable(new Error('plain')), false);
});
