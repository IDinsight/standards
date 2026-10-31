import assert from 'node:assert/strict';
import test from 'node:test';

import { LockoutTracker } from '../src/auth/lockout.js';
import { login } from '../src/auth/login.js';
import { withAuth } from '../src/auth/middleware.js';
import { hashPassword } from '../src/auth/passwords.js';
import { issueToken } from '../src/auth/tokens.js';

const secret = 'test-secret';

function setup() {
  const users = new Map([['ada@example.org', { id: 7, password: hashPassword('correct horse') }]]);
  return { users, lockout: new LockoutTracker(), secret };
}

const ok = () => ({ status: 200, headers: {}, body: {} });

test('valid credentials return a token', () => {
  const res = login(setup(), { email: 'Ada@Example.org ', password: 'correct horse' });
  assert.equal(res.status, 200);
  assert.match(res.body.token, /^[\w-]+\.[\w-]+$/);
});

test('missing fields return missing_credentials', () => {
  const res = login(setup(), { email: 'ada@example.org' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'missing_credentials');
});

test('wrong password returns invalid_credentials', () => {
  const res = login(setup(), { email: 'ada@example.org', password: 'nope' });
  assert.equal(res.status, 401);
  assert.deepEqual(res.body, { error: { code: 'invalid_credentials', message: 'Email or password is incorrect.' } });
});

test('protected handler rejects a missing token', () => {
  const res = withAuth(ok, secret)({ headers: {} });
  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, 'token_missing');
});

test('protected handler rejects an expired token', () => {
  const token = issueToken(7, secret, Date.now() - 2 * 60 * 60 * 1000);
  const res = withAuth(ok, secret)({ headers: { authorization: 'Bearer ' + token } });
  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, 'token_expired');
});

test('protected handler passes the user id through', () => {
  const handler = withAuth(({ userId }) => ({ status: 200, headers: {}, body: { userId } }), secret);
  const res = handler({ headers: { authorization: 'Bearer ' + issueToken(7, secret) } });
  assert.deepEqual(res.body, { userId: 7 });
});
