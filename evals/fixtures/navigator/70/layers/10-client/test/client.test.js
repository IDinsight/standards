import assert from 'node:assert/strict';
import test from 'node:test';

import { fetchOrder } from '../src/client.js';

test('fetchOrder retries a timed-out request', async () => {
  const paths = [];
  const request = async (path) => {
    paths.push(path);
    if (paths.length === 1) throw Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' });
    return { id: 'A 1' };
  };
  const order = await fetchOrder('A 1', { request, wait: async () => {} });
  assert.deepEqual(order, { id: 'A 1' });
  assert.deepEqual(paths, ['/orders/A%201', '/orders/A%201']);
});
