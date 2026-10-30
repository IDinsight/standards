import assert from 'node:assert/strict';
import test from 'node:test';

import { verify } from '../src/signing.js';
import { deliver } from '../src/webhook.js';

const endpoint = { url: 'https://hooks.example.test/in', secret: 'shh' };

function fakeFetch(status, calls) {
  return async (url, init) => {
    calls.push({ url, init });
    return { ok: status >= 200 && status < 300, status };
  };
}

test('posts the event as signed JSON', async () => {
  const calls = [];
  await deliver(endpoint, { type: 'order.created', id: 7 }, { fetchImpl: fakeFetch(204, calls) });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, endpoint.url);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.body, '{"type":"order.created","id":7}');
  assert.equal(verify(calls[0].init.body, endpoint.secret, calls[0].init.headers['x-hookrelay-signature']), true);
});

test('reports success for a 2xx response', async () => {
  const result = await deliver(endpoint, { id: 1 }, { fetchImpl: fakeFetch(200, []) });
  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
});

test('reports failure for a rejected delivery', async () => {
  const result = await deliver(endpoint, { id: 1 }, { fetchImpl: fakeFetch(404, []) });
  assert.equal(result.ok, false);
  assert.equal(result.status, 404);
});
