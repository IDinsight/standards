import assert from 'node:assert/strict';
import test from 'node:test';

import { backoffMs, deliver } from '../src/deliver.js';

const noSleep = async () => {};

test('delivers on the first successful attempt', async () => {
  const result = await deliver(async () => {}, { id: 1 }, {
    retryLimit: 5,
    sleep: noSleep,
    deadLetter: async () => assert.fail('unexpected dead letter'),
  });
  assert.deepEqual(result, { status: 'delivered', attempts: 1 });
});

test('retries up to the limit then dead-letters', async () => {
  let calls = 0;
  const letters = [];
  const result = await deliver(async () => {
    calls += 1;
    throw new Error('503');
  }, { id: 2 }, { retryLimit: 2, sleep: noSleep, deadLetter: async (entry) => { letters.push(entry); } });
  assert.equal(calls, 3);
  assert.deepEqual(result, { status: 'dead-lettered', attempts: 3 });
  assert.deepEqual(letters, [{ id: 2, error: '503', attempts: 3 }]);
});

test('backoff doubles and caps at 30 seconds', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6].map((attempt) => backoffMs(attempt)),
    [1000, 2000, 4000, 8000, 16000, 30000]);
});
