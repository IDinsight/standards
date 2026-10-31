import assert from 'node:assert/strict';
import test from 'node:test';

import { loadConfig } from '../src/config.js';

test('defaults', () => {
  assert.deepEqual(loadConfig({}), {
    port: 8080,
    targetUrl: null,
    retryLimit: 5,
    deadLetterPath: 'data/dead-letter.jsonl',
  });
});

test('reads RETRY_LIMIT', () => {
  assert.equal(loadConfig({ RETRY_LIMIT: '8' }).retryLimit, 8);
});

test('rejects a non-positive RETRY_LIMIT', () => {
  assert.throws(() => loadConfig({ RETRY_LIMIT: '0' }), /RETRY_LIMIT must be a positive integer/);
});
