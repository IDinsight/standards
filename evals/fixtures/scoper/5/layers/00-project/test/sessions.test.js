import assert from 'node:assert/strict';
import test from 'node:test';

import { SessionStore } from '../src/sessions.js';

test('returns a session it created', () => {
  const store = new SessionStore({ now: () => 1000 });
  const session = store.create('agent-1');
  assert.equal(store.get(session.id).userId, 'agent-1');
});

test('drops sessions older than 12 hours', () => {
  let now = 0;
  const store = new SessionStore({ now: () => now });
  const session = store.create('agent-1');
  now = 12 * 60 * 60 * 1000 + 1;
  assert.equal(store.get(session.id), null);
});

test('destroy removes the session', () => {
  const store = new SessionStore();
  const session = store.create('agent-2');
  store.destroy(session.id);
  assert.equal(store.get(session.id), null);
});
