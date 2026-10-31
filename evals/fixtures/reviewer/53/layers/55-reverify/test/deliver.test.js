import assert from 'node:assert/strict';
import test from 'node:test';

import { deliver } from '../src/deliver.js';

// A transport that answers with the given outcomes in order, repeating the
// last one; an Error outcome rejects like a network failure.
function scripted(...outcomes) {
  const calls = [];
  const send = async (payload) => {
    calls.push(payload);
    const next = outcomes[Math.min(calls.length, outcomes.length) - 1];
    if (next instanceof Error) throw next;
    return { status: next };
  };
  return { send, calls };
}

function recorder() {
  const waits = [];
  return { waits, wait: async (ms) => { waits.push(ms); } };
}

test('reports a 2xx response as delivered', async () => {
  const { send } = scripted(204);
  const result = await deliver(send, { id: 1 });
  assert.deepEqual(result, { delivered: true, attempts: 1, status: 204, error: null });
});

test('does not retry a 4xx response', async () => {
  const { send, calls } = scripted(404, 200);
  const { waits, wait } = recorder();
  const result = await deliver(send, { id: 1 }, { wait });
  assert.deepEqual(result, { delivered: false, attempts: 1, status: 404, error: null });
  assert.equal(calls.length, 1);
  assert.deepEqual(waits, []);
});

test('retries a 5xx response until it succeeds', async () => {
  const { send } = scripted(503, 503, 200);
  const { waits, wait } = recorder();
  const result = await deliver(send, { id: 1 }, { wait });
  assert.deepEqual(result, { delivered: true, attempts: 3, status: 200, error: null });
  assert.deepEqual(waits, [500, 1000]);
});

test('retries after a network error', async () => {
  const { send } = scripted(new Error('ECONNRESET'), 200);
  const { waits, wait } = recorder();
  const result = await deliver(send, { id: 1 }, { wait });
  assert.deepEqual(result, { delivered: true, attempts: 2, status: 200, error: null });
  assert.deepEqual(waits, [500]);
});

test('stops after maxAttempts without waiting after the last attempt', async () => {
  const { send, calls } = scripted(502);
  const { waits, wait } = recorder();
  const result = await deliver(send, { id: 1 }, { maxAttempts: 4, baseDelayMs: 100, maxDelayMs: 250, wait });
  assert.deepEqual(result, { delivered: false, attempts: 4, status: 502, error: null });
  assert.equal(calls.length, 4);
  assert.deepEqual(waits, [100, 200, 250]);
});

test('uses the default retry settings', async () => {
  const { send } = scripted(new Error('ETIMEDOUT'));
  const { waits, wait } = recorder();
  const result = await deliver(send, { id: 1 }, { wait });
  assert.deepEqual(result, { delivered: false, attempts: 3, status: null, error: 'ETIMEDOUT' });
  assert.deepEqual(waits, [500, 1000]);
});
