import assert from 'node:assert/strict';
import test from 'node:test';

import { signToken, verifyToken } from '../src/tokens.js';

const secret = 'test-secret';

test('verifies a token it signed', () => {
  const token = signToken({ userId: 'u1', expiresAt: 2_000 }, secret);
  assert.deepEqual(verifyToken(token, secret, 1_000), { userId: 'u1', expiresAt: 2_000 });
});

test('token has the documented userId.expiresAt.signature form', () => {
  const token = signToken({ userId: 'u1', expiresAt: 2_000 }, secret);
  const [userId, expiresAt, signature] = token.split('.');
  assert.equal(token.split('.').length, 3);
  assert.equal(userId, 'u1');
  assert.equal(expiresAt, '2000');
  assert.ok(signature.length > 0);
});

test('rejects a tampered token', () => {
  const token = signToken({ userId: 'u1', expiresAt: 2_000 }, secret);
  assert.equal(verifyToken(token.replace('u1', 'u2'), secret, 1_000), null);
});

test('rejects an expired token', () => {
  const token = signToken({ userId: 'u1', expiresAt: 2_000 }, secret);
  assert.equal(verifyToken(token, secret, 2_000), null);
});

test('rejects a token signed with another secret', () => {
  const token = signToken({ userId: 'u1', expiresAt: 2_000 }, 'other-secret');
  assert.equal(verifyToken(token, secret, 1_000), null);
});
