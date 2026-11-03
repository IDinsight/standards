import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { loadConfig } from '../src/config.js';

const defaults = JSON.parse(readFileSync(new URL('./fixtures/defaults.json', import.meta.url), 'utf8'));

test('loadConfig returns the defaults when nothing is overridden', () => {
  assert.deepEqual(loadConfig(), defaults);
});

test('overrides replace individual defaults', () => {
  const config = loadConfig({ archiveDir: '/var/exports', compress: 0 });
  assert.equal(config.archiveDir, '/var/exports');
  assert.equal(config.compress, false);
  assert.equal(config.retentionDays, defaults.retentionDays);
});

test('rejects a retention that is not a positive integer', () => {
  assert.throws(() => loadConfig({ retentionDays: 0 }), RangeError);
  assert.throws(() => loadConfig({ retentionDays: 2.5 }), RangeError);
});
