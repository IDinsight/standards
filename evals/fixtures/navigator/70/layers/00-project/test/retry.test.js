import assert from 'node:assert/strict';
import test from 'node:test';

import { RetryError, isRetryable, withRetry } from '../src/retry.js';

const reset = () => Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' });

function recorder() {
  const waits = [];
  return { waits, wait: async (ms) => { waits.push(ms); } };
}

test('returns the first successful result', async () => {
  const { waits, wait } = recorder();
  assert.equal(await withRetry(async () => 'ok', { wait }), 'ok');
  assert.deepEqual(waits, []);
});

test('waits 200 ms then 400 ms between retryable failures', async () => {
  const { waits, wait } = recorder();
  let calls = 0;
  const result = await withRetry(async () => {
    calls += 1;
    if (calls < 3) throw reset();
    return 'ok';
  }, { wait });
  assert.equal(result, 'ok');
  assert.equal(calls, 3);
  assert.deepEqual(waits, [200, 400]);
});

test('rethrows a non-retryable error without waiting', async () => {
  const { waits, wait } = recorder();
  const failure = new Error('bad request');
  let calls = 0;
  await assert.rejects(
    withRetry(async () => { calls += 1; throw failure; }, { wait }),
    (error) => error === failure,
  );
  assert.equal(calls, 1);
  assert.deepEqual(waits, []);
});

test('throws RetryError after the last attempt', async () => {
  const { waits, wait } = recorder();
  await assert.rejects(withRetry(async () => { throw reset(); }, { wait }), (error) => {
    assert.ok(error instanceof RetryError);
    assert.equal(error.attempts, 3);
    assert.equal(error.cause.code, 'ECONNRESET');
    return true;
  });
  assert.deepEqual(waits, [200, 400]);
});

test('caps the delay at maxDelayMs', async () => {
  const { waits, wait } = recorder();
  await assert.rejects(
    withRetry(async () => { throw reset(); }, { wait, attempts: 6, baseDelayMs: 300, maxDelayMs: 1000 }),
    RetryError,
  );
  assert.deepEqual(waits, [300, 600, 1000, 1000, 1000]);
});

test('treats retryable: true as retryable', () => {
  assert.equal(isRetryable(Object.assign(new Error('busy'), { retryable: true })), true);
  assert.equal(isRetryable(new Error('nope')), false);
});
