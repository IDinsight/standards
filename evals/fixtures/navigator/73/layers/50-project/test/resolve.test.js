import assert from 'node:assert/strict';
import test from 'node:test';

import { resolve } from '../src/resolve.js';
import { createStore } from '../src/store.js';

const entries = [
  { code: 'docs', url: 'https://example.org/docs' },
  { code: 'old', url: 'https://example.org/old', expiresAt: '2026-01-01T00:00:00Z' },
];

test('redirects a known code and counts the hit', () => {
  const store = createStore(entries);
  assert.deepEqual(resolve(store, 'DOCS', new Date('2026-09-01T00:00:00Z')), { status: 302, location: 'https://example.org/docs' });
  assert.equal(store.get('docs').hits, 1);
});

test('answers 404 for an unknown code', () => {
  assert.deepEqual(resolve(createStore(entries), 'nope'), { status: 404, location: null });
});

test('answers 410 for an expired link', () => {
  const store = createStore(entries);
  assert.deepEqual(resolve(store, 'old', new Date('2026-09-01T00:00:00Z')), { status: 410, location: null });
  assert.equal(store.get('old').hits, 0);
});
