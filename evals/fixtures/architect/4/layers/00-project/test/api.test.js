import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';

import { createApp } from '../src/app.js';

async function start(t) {
  const lines = [];
  const callbacks = [];
  const app = createApp({
    logSink: (line) => lines.push(JSON.parse(line)),
    fetchImpl: async (url, init) => {
      callbacks.push({ url, body: JSON.parse(init.body) });
      return { status: 204 };
    },
  });
  app.server.listen(0, '127.0.0.1');
  await once(app.server, 'listening');
  t.after(() => app.close());
  return { app, base: `http://127.0.0.1:${app.server.address().port}`, lines, callbacks };
}

function postExport(base, body) {
  return fetch(`${base}/exports`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('POST /exports queues the export and calls back when it is done', async (t) => {
  const { app, base, callbacks } = await start(t);
  const response = await postExport(base, { report: 'monthly-usage', callbackUrl: 'https://client.example/hooks/exports' });
  assert.equal(response.status, 202);
  const { exportId, status } = await response.json();
  assert.equal(status, 'queued');
  await app.bus.idle();
  assert.deepEqual(callbacks, [
    { url: 'https://client.example/hooks/exports', body: { exportId, status: 'done', rowCount: 2 } },
  ]);
  const current = await (await fetch(`${base}/exports/${exportId}`)).json();
  assert.equal(current.status, 'done');
});

test('POST /exports rejects a body without a callback URL', async (t) => {
  const { base } = await start(t);
  const response = await postExport(base, { report: 'monthly-usage' });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'report and callbackUrl are required' });
});

test('API log lines for a request carry the id returned in x-request-id', async (t) => {
  const { app, base, lines } = await start(t);
  const response = await postExport(base, { report: 'active-accounts', callbackUrl: 'https://client.example/hooks/exports' });
  await response.json();
  await app.bus.idle();
  const requestId = response.headers.get('x-request-id');
  assert.match(requestId, /^[0-9a-f-]{36}$/);
  const apiLines = lines.filter((line) => line.component === 'api');
  assert.ok(apiLines.length >= 2);
  assert.ok(apiLines.every((line) => line.requestId === requestId));
});
