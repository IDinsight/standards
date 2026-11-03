import assert from 'node:assert/strict';
import test from 'node:test';

import { ReportCache } from '../src/cache.js';

test('stores and returns cached reports', () => {
  const cache = new ReportCache();
  cache.set('region:north', '<h1>Reports</h1>');
  assert.equal(cache.get('region:north'), '<h1>Reports</h1>');
});

test('invalidate removes a cached report', () => {
  const cache = new ReportCache();
  cache.set('region:north', 'x');
  cache.invalidate('region:north');
  assert.equal(cache.get('region:north'), undefined);
});
