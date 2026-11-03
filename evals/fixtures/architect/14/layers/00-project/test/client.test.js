import assert from 'node:assert/strict';
import test from 'node:test';

import { RatesClient } from '../src/client.js';

function provider(rates) {
  const calls = [];
  const fetchRate = async (base, quote) => {
    const pair = base + '/' + quote;
    calls.push(pair);
    return rates[pair];
  };
  return { calls, fetchRate };
}

test('caches a rate per currency pair', async () => {
  const { calls, fetchRate } = provider({ 'USD/EUR': 0.92, 'USD/GBP': 0.79 });
  const client = new RatesClient({ fetchRate });
  assert.equal(await client.getRate('USD', 'EUR'), 0.92);
  assert.equal(await client.getRate('USD', 'EUR'), 0.92);
  assert.equal(await client.getRate('USD', 'GBP'), 0.79);
  assert.deepEqual(calls, ['USD/EUR', 'USD/GBP']);
});

test('normalizes currency codes to upper case', async () => {
  const { calls, fetchRate } = provider({ 'USD/EUR': 0.92 });
  const client = new RatesClient({ fetchRate });
  await client.getRate('usd', 'eur');
  await client.getRate('USD', 'Eur');
  assert.deepEqual(calls, ['USD/EUR']);
});

test('clearCache forces the next lookup to fetch again', async () => {
  const { calls, fetchRate } = provider({ 'USD/EUR': 0.92 });
  const client = new RatesClient({ fetchRate });
  await client.getRate('USD', 'EUR');
  client.clearCache();
  await client.getRate('USD', 'EUR');
  assert.deepEqual(calls, ['USD/EUR', 'USD/EUR']);
});
