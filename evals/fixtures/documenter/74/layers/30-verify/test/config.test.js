import assert from 'node:assert/strict';
import test from 'node:test';

import { loadConfig } from '../src/config.js';
import { createWorker } from '../src/worker.js';

test('uses defaults when nothing is set', () => {
  assert.deepEqual(loadConfig({}), { endpoint: 'http://localhost:8080/hooks', backoffMs: 500, maxAttempts: 3 });
});

test('reads endpoint and backoff from the environment', () => {
  const config = loadConfig({ WEBHOOK_ENDPOINT: 'https://hooks.example.test/in', WEBHOOK_BACKOFF_MS: '250' });
  assert.equal(config.endpoint, 'https://hooks.example.test/in');
  assert.equal(config.backoffMs, 250);
});

test('treats an empty WEBHOOK_MAX_ATTEMPTS as unset', () => {
  assert.equal(loadConfig({ WEBHOOK_MAX_ATTEMPTS: '' }).maxAttempts, 3);
});

test('accepts WEBHOOK_MAX_ATTEMPTS from 1 to 10', () => {
  for (const value of ['1', '4', '10']) {
    assert.equal(loadConfig({ WEBHOOK_MAX_ATTEMPTS: value }).maxAttempts, Number(value));
  }
});

test('rejects WEBHOOK_MAX_ATTEMPTS outside 1 to 10', () => {
  for (const value of ['0', '11']) {
    assert.throws(() => loadConfig({ WEBHOOK_MAX_ATTEMPTS: value }), /WEBHOOK_MAX_ATTEMPTS/);
  }
});

test('rejects non-numeric WEBHOOK_MAX_ATTEMPTS', () => {
  for (const value of ['three', '2.5', '-1']) {
    assert.throws(() => loadConfig({ WEBHOOK_MAX_ATTEMPTS: value }), /WEBHOOK_MAX_ATTEMPTS/);
  }
});

test('worker creation fails for an invalid limit', () => {
  assert.throws(() => createWorker({ send: async () => {}, env: { WEBHOOK_MAX_ATTEMPTS: '0' } }), /WEBHOOK_MAX_ATTEMPTS/);
});
