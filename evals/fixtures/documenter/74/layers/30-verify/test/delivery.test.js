import assert from 'node:assert/strict';
import test from 'node:test';

import { deliver } from '../src/delivery.js';

const noSleep = async () => {};

test('delivers on first success', async () => {
  const sent = [];
  const result = await deliver({ id: 1 }, {
    send: async (event) => { sent.push(event.id); },
    sleep: noSleep,
    maxAttempts: 3,
    backoffMs: 500,
  });
  assert.deepEqual(result, { delivered: true, attempts: 1 });
  assert.deepEqual(sent, [1]);
});

test('stops after maxAttempts failures with doubling backoff', async () => {
  const waits = [];
  let calls = 0;
  const result = await deliver({ id: 2 }, {
    send: async () => { calls += 1; throw new Error('503 Service Unavailable'); },
    sleep: async (ms) => { waits.push(ms); },
    maxAttempts: 3,
    backoffMs: 500,
  });
  assert.deepEqual(result, { delivered: false, attempts: 3, error: '503 Service Unavailable' });
  assert.equal(calls, 3);
  assert.deepEqual(waits, [500, 1000]);
});

test('makes a single attempt when maxAttempts is 1', async () => {
  const waits = [];
  const result = await deliver({ id: 3 }, {
    send: async () => { throw new Error('timeout'); },
    sleep: async (ms) => { waits.push(ms); },
    maxAttempts: 1,
    backoffMs: 500,
  });
  assert.equal(result.attempts, 1);
  assert.deepEqual(waits, []);
});
