import assert from 'node:assert/strict';
import test from 'node:test';

import { CancelledError, RetryExhaustedError, backoffDelay, retry } from '../src/retry.js';
import { HttpError } from '../src/transport.js';

test('returns the first successful result', async () => {
  let calls = 0;
  const value = await retry(async () => {
    calls += 1;
    if (calls < 2) throw new Error('flaky');
    return 'ok';
  }, { baseDelayMs: 1 });
  assert.equal(value, 'ok');
  assert.equal(calls, 2);
});

test('gives up after the configured attempts', async () => {
  let calls = 0;
  await assert.rejects(retry(async () => {
    calls += 1;
    throw new Error('down');
  }, { attempts: 3, baseDelayMs: 1 }), (error) => error instanceof RetryExhaustedError && error.attempts === 3);
  assert.equal(calls, 3);
});

test('rethrows errors that are not retryable', async () => {
  let calls = 0;
  const failure = new HttpError(400, 'bad request');
  await assert.rejects(retry(async () => {
    calls += 1;
    throw failure;
  }, { baseDelayMs: 1 }), (error) => error === failure);
  assert.equal(calls, 1);
});

test('backoff doubles up to the maximum', () => {
  const options = { baseDelayMs: 200, maxDelayMs: 2000 };
  assert.deepEqual([1, 2, 3, 4, 5].map((attempt) => backoffDelay(attempt, options)), [200, 400, 800, 1600, 2000]);
});

test('does not start when already cancelled', async () => {
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  await assert.rejects(retry(async () => {
    calls += 1;
  }, { signal: controller.signal, baseDelayMs: 1 }), CancelledError);
  assert.equal(calls, 0);
});

test('cancelling during a wait rejects with CancelledError', async () => {
  const controller = new AbortController();
  let calls = 0;
  const pending = retry(async () => {
    calls += 1;
    throw new Error('down');
  }, { baseDelayMs: 60_000, signal: controller.signal });
  setTimeout(() => controller.abort(), 5);
  await assert.rejects(pending, CancelledError);
  assert.equal(calls, 1);
});

test('passes the signal to the operation', async () => {
  const controller = new AbortController();
  let received;
  await retry(async (attempt, signal) => {
    received = signal;
    return 'ok';
  }, { signal: controller.signal });
  assert.equal(received, controller.signal);
});
