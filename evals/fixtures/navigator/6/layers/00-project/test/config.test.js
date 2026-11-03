import assert from 'node:assert/strict';
import test from 'node:test';

import { loadConfig } from '../src/config.js';

test('uses defaults from config/default.json', () => {
  const config = loadConfig({});
  assert.equal(config.batchSize, 500);
  assert.equal(config.maxInFlight, 4);
  assert.equal(config.flushIntervalMs, 2000);
});

test('environment variables override defaults', () => {
  assert.equal(loadConfig({ INGEST_BATCH_SIZE: '1000' }).batchSize, 1000);
  assert.equal(loadConfig({ INGEST_MAX_IN_FLIGHT: '8' }).maxInFlight, 8);
});

test('rejects a zero batch size', () => {
  assert.throws(() => loadConfig({ INGEST_BATCH_SIZE: '0' }), /batchSize/);
});
