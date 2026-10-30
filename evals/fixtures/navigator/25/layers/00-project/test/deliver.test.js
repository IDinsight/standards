import assert from 'node:assert/strict';
import test from 'node:test';

import { deliver } from '../src/webhooks/deliver.js';

test('returns the status of a successful delivery', async () => {
  const result = await deliver(async () => ({ status: 202 }), { id: 1 });
  assert.deepEqual(result, { ok: true, status: 202, attempts: 1 });
});

test('reports a failed delivery', async () => {
  const result = await deliver(async () => { throw new Error('connection refused'); }, { id: 2 });
  assert.deepEqual(result, { ok: false, error: 'connection refused', attempts: 1 });
});
