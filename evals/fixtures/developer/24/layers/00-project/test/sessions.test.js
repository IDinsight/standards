import assert from 'node:assert/strict';
import test from 'node:test';

import { SESSION_TTL_MS, createSession, isExpired } from '../src/sessions.js';

test('new session expires after the session lifetime', () => {
  const session = createSession(7, 1000);
  assert.equal(session.userId, 7);
  assert.equal(session.expiresAt, 1000 + SESSION_TTL_MS);
  assert.match(session.id, /^[0-9a-f]{32}$/);
});

test('session is expired at its expiry time', () => {
  const session = createSession(7, 0);
  assert.equal(isExpired(session, SESSION_TTL_MS - 1), false);
  assert.equal(isExpired(session, SESSION_TTL_MS), true);
});
