import assert from 'node:assert/strict';
import test from 'node:test';

import { loadConfig } from '../src/config.js';
import { ENDPOINTS, resolveEndpoint } from '../src/endpoints.js';

test('configured endpoint name resolves to a known base URL', () => {
  const config = loadConfig(undefined, {});
  assert.equal(config.rates.baseUrl, ENDPOINTS[config.rates.endpointName]);
});

test('RATES_ENDPOINT overrides the configured endpoint', () => {
  const config = loadConfig(undefined, { RATES_ENDPOINT: 'rates-sandbox' });
  assert.equal(config.rates.endpointName, 'rates-sandbox');
  assert.equal(config.rates.baseUrl, 'https://sandbox.api.ratebridge.net/v2');
});

test('unknown endpoint names are rejected', () => {
  assert.throws(() => resolveEndpoint('rates-apac'), /Unknown rates endpoint/);
});
