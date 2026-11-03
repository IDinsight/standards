import assert from 'node:assert/strict';
import test from 'node:test';

import { deliver } from '../src/deliver.js';

test('reports a 2xx response as delivered', async () => {
  const result = await deliver(async () => ({ status: 204 }), { id: 1 });
  assert.deepEqual(result, { delivered: true, attempts: 1, status: 204, error: null });
});

test('reports a 404 response as not delivered', async () => {
  const result = await deliver(async () => ({ status: 404 }), { id: 1 });
  assert.deepEqual(result, { delivered: false, attempts: 1, status: 404, error: null });
});
