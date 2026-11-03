import assert from 'node:assert/strict';
import test from 'node:test';

import { loadConfig } from '../src/config.js';

test('uses a 5 second timeout by default', () => {
  assert.equal(loadConfig({}).timeoutMs, 5000);
});

test('rejects a non-numeric timeout', () => {
  assert.throws(() => loadConfig({ RELAY_TIMEOUT_MS: 'soon' }), /RELAY_TIMEOUT_MS/);
});
