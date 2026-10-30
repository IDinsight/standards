import assert from 'node:assert/strict';
import test from 'node:test';

import { createRatesClient, RatesHttpError, RatesTimeoutError } from '../src/rates-client.js';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const timedOut = () => Object.assign(new Error('The operation was aborted due to timeout'), { name: 'TimeoutError' });

function client(responses) {
  const calls = [];
  const sleeps = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return next;
  };
  const rates = createRatesClient({
    baseUrl: 'http://rates.test',
    timeoutMs: 50,
    retries: 2,
    backoffMs: 10,
    fetchImpl,
    sleep: async (ms) => { sleeps.push(ms); },
  });
  return { rates, calls, sleeps };
}

test('returns rates from the first successful attempt', async () => {
  const { rates, calls } = client([ok({ rates: [{ service: 'ground', cents: 899 }] })]);
  assert.deepEqual(await rates.getRates({ origin: '10001', destination: '94105', weightGrams: 500 }),
    { rates: [{ service: 'ground', cents: 899 }] });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'http://rates.test/v2/rates');
});

test('retries timeouts with exponential backoff', async () => {
  const { rates, calls, sleeps } = client([timedOut(), timedOut(), ok({ rates: [] })]);
  assert.deepEqual(await rates.getRates({}), { rates: [] });
  assert.equal(calls.length, 3);
  assert.deepEqual(sleeps, [10, 20]);
});

test('gives up after the configured retries', async () => {
  const { rates, calls } = client([timedOut(), timedOut(), timedOut()]);
  await assert.rejects(rates.getRates({}), RatesTimeoutError);
  assert.equal(calls.length, 3);
});

test('does not retry client errors', async () => {
  const { rates, calls } = client([{ ok: false, status: 422, json: async () => ({}) }]);
  await assert.rejects(rates.getRates({}), (error) => error instanceof RatesHttpError && error.status === 422);
  assert.equal(calls.length, 1);
});
