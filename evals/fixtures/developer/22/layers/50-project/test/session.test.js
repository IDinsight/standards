import assert from 'node:assert/strict';
import test from 'node:test';

import { SESSION_TTL_MS, SessionStore, readSessionCookie, sessionCookieHeader } from '../shared/session.js';

test('sessions resolve until the TTL passes', () => {
  let now = 1_000;
  const store = new SessionStore(() => now);
  const id = store.create(5, { scopes: ['profile:read'] });
  assert.equal(store.lookup(id).userId, 5);
  now += SESSION_TTL_MS;
  assert.equal(store.lookup(id), null);
});

test('revoked sessions no longer resolve', () => {
  const store = new SessionStore();
  const id = store.create(3);
  assert.equal(store.revoke(id), true);
  assert.equal(store.lookup(id), null);
});

test('readSessionCookie finds sid among other cookies', () => {
  assert.equal(readSessionCookie('theme=dark; sid=abc123; lang=en'), 'abc123');
  assert.equal(readSessionCookie('theme=dark'), null);
  assert.equal(readSessionCookie(undefined), null);
});

test('the session cookie is HttpOnly and lasts as long as the session', () => {
  const header = sessionCookieHeader('abc');
  assert.match(header, /^sid=abc;/);
  assert.match(header, /HttpOnly/);
  assert.match(header, /Max-Age=2592000/);
});
