import assert from 'node:assert/strict';
import test from 'node:test';

import { createRatesClient } from '../src/rates-client.js';

const settings = { baseUrl: 'https://rates.test/v2', token: 'test-token', timeoutMs: 1000 };

test('requests latest rates from the base URL with a bearer token', async () => {
  const calls = [];
  const fakeFetch = async (url, init) => {
    calls.push({ url, init });
    return { ok: true, json: async () => ({ rates: { EUR: 1 } }) };
  };
  const client = createRatesClient(settings, fakeFetch);
  const data = await client.latest(['EUR', 'GBP']);
  assert.deepEqual(data, { rates: { EUR: 1 } });
  assert.equal(calls[0].url, 'https://rates.test/v2/rates/latest?symbols=EUR%2CGBP');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer test-token');
});

test('non-2xx responses raise with the status', async () => {
  const fakeFetch = async () => ({ ok: false, status: 429, json: async () => ({}) });
  const client = createRatesClient(settings, fakeFetch);
  await assert.rejects(() => client.latest(['EUR']), /failed with 429/);
});
