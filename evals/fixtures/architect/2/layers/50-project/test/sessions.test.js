import assert from 'node:assert/strict';
import test from 'node:test';

import { SessionStore } from '../api/src/sessions.js';

test('a new session can be read back with its CSRF token', () => {
  const store = new SessionStore({ ttlSeconds: 60, now: () => 1000 });
  const created = store.create({ id: 7, role: 'member' });
  const found = store.get(created.id);
  assert.equal(found.userId, 7);
  assert.equal(found.role, 'member');
  assert.equal(found.csrfToken, created.csrfToken);
});

test('sessions expire after the TTL unless touched', () => {
  let now = 0;
  const store = new SessionStore({ ttlSeconds: 60, now: () => now });
  const kept = store.create({ id: 1, role: 'member' });
  const dropped = store.create({ id: 2, role: 'member' });
  now = 50_000;
  store.touch(kept.id);
  now = 70_000;
  assert.ok(store.get(kept.id));
  assert.equal(store.get(dropped.id), null);
});

test('destroyForUser removes every session of that user', () => {
  const store = new SessionStore({ ttlSeconds: 60 });
  const first = store.create({ id: 1, role: 'member' });
  const second = store.create({ id: 1, role: 'member' });
  const other = store.create({ id: 2, role: 'admin' });
  store.destroyForUser(1);
  assert.equal(store.get(first.id), null);
  assert.equal(store.get(second.id), null);
  assert.ok(store.get(other.id));
});
