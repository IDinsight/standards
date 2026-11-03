import assert from 'node:assert/strict';
import test from 'node:test';

import { loadConfig } from '../src/config.js';

test('uses defaults when the environment is empty', () => {
  assert.deepEqual(loadConfig({}), { port: 8080, webhookUrl: 'http://localhost:9000/hooks' });
});

test('reads port and webhook URL from the environment', () => {
  assert.deepEqual(loadConfig({ PORT: '3000', WEBHOOK_URL: 'https://hooks.example.test/in' }), {
    port: 3000,
    webhookUrl: 'https://hooks.example.test/in',
  });
});
