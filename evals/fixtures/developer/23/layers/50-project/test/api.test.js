import assert from 'node:assert/strict';
import test from 'node:test';

import { handleRequest } from '../src/api/handler.js';
import { issueToken } from '../src/auth/token.js';

const secret = 'test-secret';
const routes = { '/me': (req, claims) => ({ status: 200, body: { sub: claims.sub } }) };

test('valid bearer token reaches the route', () => {
  const token = issueToken({ sub: 'u2' }, secret);
  const res = handleRequest({ path: '/me', headers: { authorization: `Bearer ${token}` } }, { secret, routes });
  assert.deepEqual(res, { status: 200, body: { sub: 'u2' } });
});

test('missing token returns 401', () => {
  const res = handleRequest({ path: '/me', headers: {} }, { secret, routes });
  assert.deepEqual(res, { status: 401, body: { error: 'malformed' } });
});

test('unknown path returns 404 for an authenticated caller', () => {
  const token = issueToken({ sub: 'u2' }, secret);
  const res = handleRequest({ path: '/nowhere', headers: { authorization: `Bearer ${token}` } }, { secret, routes });
  assert.equal(res.status, 404);
});
