import assert from 'node:assert/strict';
import test from 'node:test';

import { issueToken, verifyToken } from '../src/auth/token.js';

const secret = 'test-secret';

test('issued token verifies with the same secret', () => {
  const token = issueToken({ sub: 'u1', scopes: ['read'] }, secret);
  const result = verifyToken(token, secret);
  assert.equal(result.ok, true);
  assert.equal(result.payload.sub, 'u1');
  assert.deepEqual(result.payload.scopes, ['read']);
});

test('token signed with another secret is rejected', () => {
  const token = issueToken({ sub: 'u1' }, 'other-secret');
  assert.deepEqual(verifyToken(token, secret), { ok: false, reason: 'signature' });
});

test('expired token is rejected', () => {
  const token = issueToken({ sub: 'u1' }, secret, { now: 0, ttlSeconds: 60 });
  assert.deepEqual(verifyToken(token, secret, { now: 61_000 }), { ok: false, reason: 'expired' });
});

test('malformed token is rejected', () => {
  assert.deepEqual(verifyToken('nope', secret), { ok: false, reason: 'malformed' });
});
