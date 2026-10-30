import assert from 'node:assert/strict';
import test from 'node:test';

import { Batcher } from '../src/batcher.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const records = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1 }));

test('sends full batches and the remainder on drain', async () => {
  const sent = [];
  const batcher = new Batcher({
    batchSize: 3, maxInFlight: 2, flushIntervalMs: 0,
    send: async (batch) => { sent.push(batch.map((record) => record.id)); },
  });
  for (const record of records(7)) await batcher.add(record);
  await batcher.drain();
  assert.deepEqual(sent, [[1, 2, 3], [4, 5, 6], [7]]);
  assert.deepEqual(batcher.stats, { batches: 3, records: 7, retries: 0 });
});

test('keeps at most maxInFlight batches in flight', async () => {
  let active = 0;
  let peak = 0;
  let delivered = 0;
  const batcher = new Batcher({
    batchSize: 2, maxInFlight: 2, flushIntervalMs: 0,
    send: async (batch) => {
      active += 1;
      peak = Math.max(peak, active);
      await sleep(5);
      active -= 1;
      delivered += batch.length;
    },
  });
  for (const record of records(20)) await batcher.add(record);
  await batcher.drain();
  assert.equal(peak, 2);
  assert.equal(delivered, 20);
});

test('retries a failed batch with backoff', async () => {
  let calls = 0;
  const batcher = new Batcher({
    batchSize: 2, maxInFlight: 1, flushIntervalMs: 0, maxRetries: 2, retryDelayMs: 1,
    send: async () => {
      calls += 1;
      if (calls === 1) throw new Error('sink responded 503');
    },
  });
  for (const record of records(2)) await batcher.add(record);
  await batcher.drain();
  assert.equal(calls, 2);
  assert.deepEqual(batcher.stats, { batches: 1, records: 2, retries: 1 });
  assert.equal(batcher.failed.length, 0);
});

test('records a batch as failed after the last retry', async () => {
  let calls = 0;
  const batcher = new Batcher({
    batchSize: 2, maxInFlight: 1, flushIntervalMs: 0, maxRetries: 1, retryDelayMs: 1,
    send: async () => {
      calls += 1;
      throw new Error('sink responded 500');
    },
  });
  for (const record of records(2)) await batcher.add(record);
  await batcher.drain();
  assert.equal(calls, 2);
  assert.equal(batcher.failed.length, 1);
  assert.equal(batcher.failed[0].batch.length, 2);
  assert.equal(batcher.stats.records, 0);
});

test('flushes a partial batch after flushIntervalMs', async () => {
  const sent = [];
  const batcher = new Batcher({
    batchSize: 10, maxInFlight: 1, flushIntervalMs: 20,
    send: async (batch) => { sent.push(batch.length); },
  });
  await batcher.add({ id: 1 });
  await batcher.add({ id: 2 });
  await sleep(60);
  assert.deepEqual(sent, [2]);
  await batcher.drain();
  assert.deepEqual(sent, [2]);
});
