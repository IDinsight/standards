import assert from 'node:assert/strict';
import test from 'node:test';

import { loadConfig } from '../src/config.js';
import { deliver } from '../src/deliver.js';

const config = loadConfig({});

test('reports success for a 2xx response', async () => {
  const result = await deliver({ id: 'evt_1' }, { config, send: async () => ({ status: 204 }) });
  assert.deepEqual(result, { ok: true, attempts: 1, status: 204 });
});

test('reports failure for a 4xx response', async () => {
  const result = await deliver({ id: 'evt_2' }, { config, send: async () => ({ status: 410 }) });
  assert.deepEqual(result, { ok: false, attempts: 1, status: 410 });
});

test('passes the configured timeout to send', async () => {
  let seen;
  const send = async (_event, options) => {
    seen = options;
    return { status: 200 };
  };
  await deliver({ id: 'evt_3' }, { config: loadConfig({ RELAY_TIMEOUT_MS: '1500' }), send });
  assert.equal(seen.timeoutMs, 1500);
});
