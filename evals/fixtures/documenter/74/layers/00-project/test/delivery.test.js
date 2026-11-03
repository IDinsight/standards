import assert from 'node:assert/strict';
import test from 'node:test';

import { deliver } from '../src/delivery.js';

const noSleep = async () => {};

test('delivers on first success', async () => {
  const sent = [];
  const result = await deliver({ id: 1 }, { send: async (event) => { sent.push(event.id); }, sleep: noSleep, backoffMs: 500 });
  assert.deepEqual(result, { delivered: true, attempts: 1 });
  assert.deepEqual(sent, [1]);
});

test('retries with exponential backoff and gives up after five attempts', async () => {
  const waits = [];
  const result = await deliver({ id: 2 }, {
    send: async () => { throw new Error('503 Service Unavailable'); },
    sleep: async (ms) => { waits.push(ms); },
    backoffMs: 500,
  });
  assert.equal(result.delivered, false);
  assert.equal(result.attempts, 5);
  assert.deepEqual(waits, [500, 1000, 2000, 4000]);
});
