import assert from 'node:assert/strict';
import test from 'node:test';

import { RetryExhaustedError } from '../src/retry.js';
import { syncRecords } from '../src/sync.js';
import { HttpError } from '../src/transport.js';

function fakeClient(handler) {
  const calls = [];
  return {
    calls,
    async request(method, path, body) {
      calls.push(body.records.length);
      return handler(body);
    },
  };
}

test('sends records in batches', async () => {
  const client = fakeClient(() => null);
  const result = await syncRecords(client, [1, 2, 3, 4, 5], { batchSize: 2 });
  assert.deepEqual(client.calls, [2, 2, 1]);
  assert.equal(result.sent, 5);
  assert.deepEqual(result.failed, []);
  assert.deepEqual(result.rejected, []);
});

test('records batches that could not be sent and continues', async () => {
  const client = fakeClient((body) => {
    if (body.records[0] === 1) throw new RetryExhaustedError(3, new Error('down'));
    return null;
  });
  const result = await syncRecords(client, [1, 2, 3], { batchSize: 2 });
  assert.equal(result.sent, 1);
  assert.equal(result.failed.length, 1);
  assert.equal(result.failed[0].start, 0);
  assert.equal(result.failed[0].count, 2);
});

test('reports batches the server rejects', async () => {
  const client = fakeClient((body) => {
    if (body.records[0] === 1) throw new HttpError(422, 'invalid');
    return null;
  });
  const result = await syncRecords(client, [1, 2, 3], { batchSize: 2 });
  assert.equal(result.sent, 1);
  assert.deepEqual(result.rejected, [{ start: 0, count: 2, status: 422 }]);
  assert.deepEqual(result.failed, []);
});
