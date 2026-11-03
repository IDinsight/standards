import assert from 'node:assert/strict';
import test from 'node:test';

import { LOCKOUT_MS, LockoutTracker, MAX_FAILURES } from '../src/auth/lockout.js';
import { login } from '../src/auth/login.js';
import { hashPassword } from '../src/auth/passwords.js';

function setup(clock) {
  const users = new Map([['ada@example.org', { id: 7, password: hashPassword('correct horse') }]]);
  return { users, lockout: new LockoutTracker(() => clock.now), secret: 'test-secret' };
}

function fail(ctx, times) {
  for (let i = 0; i < times; i += 1) login(ctx, { email: 'ada@example.org', password: 'nope' });
}

test('locks the account after repeated failures', () => {
  const clock = { now: 1_000_000 };
  const ctx = setup(clock);
  fail(ctx, MAX_FAILURES);
  const res = login(ctx, { email: 'ada@example.org', password: 'correct horse' });
  assert.equal(res.status, 423);
  assert.equal(res.body.error.code, 'account_locked');
  assert.equal(res.headers['Retry-After'], String(LOCKOUT_MS / 1000));
  assert.equal(res.body.error.retryAfterSeconds, LOCKOUT_MS / 1000);
});

test('unlocks after the lockout window', () => {
  const clock = { now: 1_000_000 };
  const ctx = setup(clock);
  fail(ctx, MAX_FAILURES);
  clock.now += LOCKOUT_MS;
  assert.equal(login(ctx, { email: 'ada@example.org', password: 'correct horse' }).status, 200);
});

test('a successful sign-in clears earlier failures', () => {
  const clock = { now: 1_000_000 };
  const ctx = setup(clock);
  fail(ctx, MAX_FAILURES - 1);
  assert.equal(login(ctx, { email: 'ada@example.org', password: 'correct horse' }).status, 200);
  assert.equal(login(ctx, { email: 'ada@example.org', password: 'nope' }).status, 401);
});
