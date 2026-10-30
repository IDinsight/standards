import assert from 'node:assert/strict';
import test from 'node:test';

import { Pool } from '../src/pool.js';
import { ProviderError, createProvider } from '../src/provider.js';
import { TimeoutError } from '../src/timeout.js';

const newPool = () => new Pool({ size: 1, acquireTimeoutMs: 20 });

test('requests the rate for a sku and releases the slot', async () => {
  const seen = [];
  const pool = newPool();
  const provider = createProvider({
    baseUrl: 'http://provider.test',
    pool,
    requestTimeoutMs: 50,
    fetchImpl: async (url) => {
      seen.push(String(url));
      return { ok: true, status: 200, json: async () => ({ unitPrice: 3, currency: 'EUR' }) };
    },
  });
  assert.deepEqual(await provider.rates('A 1'), { unitPrice: 3, currency: 'EUR' });
  assert.deepEqual(seen, ['http://provider.test/v2/rates/A%201']);
  assert.equal(pool.inUse, 0);
});

test('a non-2xx response raises ProviderError', async () => {
  const pool = newPool();
  const provider = createProvider({
    baseUrl: 'http://provider.test',
    pool,
    requestTimeoutMs: 50,
    fetchImpl: async () => ({ ok: false, status: 503, json: async () => ({}) }),
  });
  await assert.rejects(provider.fees('eu'), ProviderError);
  assert.equal(pool.inUse, 0);
});

test('a response slower than the request timeout raises TimeoutError and aborts', async () => {
  let aborted = false;
  const pool = newPool();
  const provider = createProvider({
    baseUrl: 'http://provider.test',
    pool,
    requestTimeoutMs: 20,
    fetchImpl: (url, { signal }) => new Promise((_, reject) => {
      signal.addEventListener('abort', () => {
        aborted = true;
        reject(new Error('aborted'));
      });
    }),
  });
  await assert.rejects(provider.fees('eu'), TimeoutError);
  assert.equal(aborted, true);
  assert.equal(pool.inUse, 0);
});
