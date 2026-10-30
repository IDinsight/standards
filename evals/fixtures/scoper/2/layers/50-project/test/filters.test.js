import assert from 'node:assert/strict';
import test from 'node:test';

import { filterEntries, parseFilters } from '../src/auditLog.js';

const entries = [
  { timestamp: '2026-09-01T10:00:00Z', actor: 'ana', action: 'login', target: 'console' },
  { timestamp: '2026-09-02T11:30:00Z', actor: 'ben', action: 'role.change', target: 'user:42' },
  { timestamp: '2026-09-03T08:15:00Z', actor: 'ana', action: 'role.change', target: 'user:7' },
];

test('no filters returns every entry', () => {
  assert.deepEqual(filterEntries(entries, parseFilters({})), entries);
});

test('filters by actor', () => {
  const result = filterEntries(entries, parseFilters({ actor: 'ana' }));
  assert.deepEqual(result.map((entry) => entry.target), ['console', 'user:7']);
});

test('combines action and date range', () => {
  const filters = parseFilters({ action: 'role.change', from: '2026-09-02T00:00:00Z', to: '2026-09-02T23:59:59Z' });
  assert.deepEqual(filterEntries(entries, filters).map((entry) => entry.target), ['user:42']);
});
