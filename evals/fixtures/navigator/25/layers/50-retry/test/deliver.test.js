import assert from 'node:assert/strict';
import test from 'node:test';

import { deliver } from '../src/webhooks/deliver.js';

const noWait = { sleep: async () => {} };

test('returns the status of a successful delivery', async () => {
  const result = await deliver(async () => ({ status: 202 }), { id: 1 }, noWait);
  assert.deepEqual(result, { ok: true, status: 202, attempts: 1 });
});

test('retries server errors with growing delays', async () => {
  const statuses = [503, 502, 200];
  const delays = [];
  const result = await deliver(async () => ({ status: statuses.shift() }), { id: 2 }, {
    sleep: async (ms) => { delays.push(ms); },
  });
  assert.deepEqual(result, { ok: true, status: 200, attempts: 3 });
  assert.deepEqual(delays, [200, 400]);
});

test('does not retry client errors', async () => {
  let calls = 0;
  const result = await deliver(async () => { calls += 1; return { status: 404 }; }, { id: 3 }, noWait);
  assert.deepEqual(result, { ok: false, status: 404, attempts: 1 });
  assert.equal(calls, 1);
});

test('gives up after the last attempt', async () => {
  const delays = [];
  const result = await deliver(async () => { throw new Error('connection refused'); }, { id: 4 }, {
    sleep: async (ms) => { delays.push(ms); },
  });
  assert.deepEqual(result, { ok: false, error: 'connection refused', attempts: 4 });
  assert.deepEqual(delays, [200, 400, 800]);
});
