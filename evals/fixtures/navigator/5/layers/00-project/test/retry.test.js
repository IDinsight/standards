import assert from 'node:assert/strict';
import test from 'node:test';

import { CancelledError, RetryExhaustedError, retry } from '../src/retry.js';

test('returns the first successful result', async () => {
  let calls = 0;
  const value = await retry(async () => {
    calls += 1;
    if (calls < 2) throw new Error('flaky');
    return 'ok';
  }, { delayMs: 1 });
  assert.equal(value, 'ok');
  assert.equal(calls, 2);
});

test('gives up after the configured attempts', async () => {
  let calls = 0;
  await assert.rejects(retry(async () => {
    calls += 1;
    throw new Error('down');
  }, { attempts: 3, delayMs: 1 }), RetryExhaustedError);
  assert.equal(calls, 3);
});

test('does not start when already cancelled', async () => {
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  await assert.rejects(retry(async () => {
    calls += 1;
  }, { signal: controller.signal, delayMs: 1 }), CancelledError);
  assert.equal(calls, 0);
});
