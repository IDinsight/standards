import assert from 'node:assert/strict';
import test from 'node:test';

import { loadConfig } from '../src/config.js';

test('defaults', () => {
  assert.deepEqual(loadConfig({}), { port: 8080, targetUrl: null });
});

test('rejects a non-numeric PORT', () => {
  assert.throws(() => loadConfig({ PORT: 'abc' }), /PORT must be a positive integer/);
});
