import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';

import { createServer } from '../src/server.js';

async function start() {
  const server = createServer({ version: '9.9.9' });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  return { server, base: `http://127.0.0.1:${port}` };
}

test('GET /health returns ok', async (t) => {
  const { server, base } = await start();
  t.after(() => server.close());
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('GET /status returns the configured version', async (t) => {
  const { server, base } = await start();
  t.after(() => server.close());
  const res = await fetch(`${base}/status`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.version, '9.9.9');
  assert.equal(typeof body.uptimeSeconds, 'number');
});

test('unknown paths return 404', async (t) => {
  const { server, base } = await start();
  t.after(() => server.close());
  const res = await fetch(`${base}/nope`);
  assert.equal(res.status, 404);
  await res.body?.cancel();
});

test('non-GET methods return 405', async (t) => {
  const { server, base } = await start();
  t.after(() => server.close());
  const res = await fetch(`${base}/status`, { method: 'POST' });
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'GET');
  await res.body?.cancel();
});
