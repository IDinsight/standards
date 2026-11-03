import assert from 'node:assert/strict';
import test from 'node:test';

import { backoffMs, deliver } from '../src/deliver.js';

const noSleep = async () => {};

test('delivers on the first successful attempt', async () => {
  const result = await deliver(async () => {}, { id: 1 }, { sleep: noSleep });
  assert.deepEqual(result, { status: 'delivered', attempts: 1 });
});

test('drops a delivery after three retries', async () => {
  let calls = 0;
  const warnings = [];
  const result = await deliver(async () => {
    calls += 1;
    throw new Error('503');
  }, { id: 2 }, { sleep: noSleep, log: (message) => warnings.push(message) });
  assert.equal(calls, 4);
  assert.deepEqual(result, { status: 'dropped', attempts: 4 });
  assert.deepEqual(warnings, ['delivery dropped: 503']);
});

test('backoff doubles from one second', () => {
  assert.deepEqual([1, 2, 3].map((attempt) => backoffMs(attempt)), [1000, 2000, 4000]);
});
