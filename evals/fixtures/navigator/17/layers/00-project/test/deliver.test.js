import assert from 'node:assert/strict';
import test from 'node:test';

import { deliver } from '../src/deliver.js';

const event = { type: 'invoice.paid', data: { id: 41 } };
const endpoint = { url: 'https://example.test/hooks' };

function recorder(status) {
  const calls = [];
  const send = async (url, init) => {
    calls.push({ url, init });
    return { status };
  };
  return { calls, send };
}

test('posts the event as JSON to the endpoint URL', async () => {
  const { calls, send } = recorder(200);
  await deliver(event, endpoint, { send });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://example.test/hooks');
  assert.equal(calls[0].init.method, 'POST');
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.type, 'invoice.paid');
  assert.deepEqual(body.data, { id: 41 });
});

test('reports a 2xx response as delivered', async () => {
  const { send } = recorder(204);
  const result = await deliver(event, endpoint, { send });
  assert.equal(result.delivered, true);
  assert.equal(result.status, 204);
});

test('reports a client error as not delivered', async () => {
  const { send } = recorder(410);
  const result = await deliver(event, endpoint, { send });
  assert.equal(result.delivered, false);
  assert.equal(result.status, 410);
});

test('sends a JSON content type only', async () => {
  const { calls, send } = recorder(200);
  await deliver(event, endpoint, { send });
  assert.deepEqual(calls[0].init.headers, { 'content-type': 'application/json' });
});
