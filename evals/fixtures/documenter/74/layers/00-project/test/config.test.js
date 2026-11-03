import assert from 'node:assert/strict';
import test from 'node:test';

import { loadConfig } from '../src/config.js';

test('uses defaults when nothing is set', () => {
  assert.deepEqual(loadConfig({}), { endpoint: 'http://localhost:8080/hooks', backoffMs: 500 });
});

test('reads endpoint and backoff from the environment', () => {
  const config = loadConfig({ WEBHOOK_ENDPOINT: 'https://hooks.example.test/in', WEBHOOK_BACKOFF_MS: '250' });
  assert.equal(config.endpoint, 'https://hooks.example.test/in');
  assert.equal(config.backoffMs, 250);
});
