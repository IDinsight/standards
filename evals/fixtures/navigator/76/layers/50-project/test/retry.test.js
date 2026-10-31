import assert from 'node:assert/strict';
import test from 'node:test';

import { HttpError, fetchJson } from '../src/client.js';
import { backoffDelay, withRetry } from '../src/retry.js';

const noSleep = async () => {};

test('backoff doubles and stops at the cap', () => {
  const limits = { baseDelayMs: 100, maxDelayMs: 2000 };
  assert.deepEqual([0, 1, 2, 5].map((attempt) => backoffDelay(attempt, limits)), [100, 200, 400, 2000]);
});

test('retries a 503 and returns the later body', async () => {
  const statuses = [503, 503, 200];
  let calls = 0;
  const transport = async () => {
    const status = statuses[calls++];
    return { status, body: status === 200 ? { ok: true } : null };
  };
  assert.deepEqual(await fetchJson(transport, '/items', { sleep: noSleep }), { ok: true });
  assert.equal(calls, 3);
});

test('does not retry a 404', async () => {
  let calls = 0;
  const transport = async () => {
    calls += 1;
    return { status: 404, body: null };
  };
  await assert.rejects(fetchJson(transport, '/missing', { sleep: noSleep }),
    (error) => error instanceof HttpError && error.status === 404);
  assert.equal(calls, 1);
});

test('gives up after the configured retries', async () => {
  const delays = [];
  let calls = 0;
  const fn = async () => {
    calls += 1;
    throw Object.assign(new Error('reset'), { code: 'ECONNRESET' });
  };
  await assert.rejects(withRetry(fn, { retries: 2, sleep: async (ms) => { delays.push(ms); } }), /reset/);
  assert.equal(calls, 3);
  assert.deepEqual(delays, [100, 200]);
});
