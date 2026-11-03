import assert from 'node:assert/strict';
import test from 'node:test';

import { hashPassword, login } from '../src/login.js';

const users = new Map([['ada', { id: 1, salt: 's1', passwordHash: hashPassword('correct horse', 's1') }]]);

test('valid credentials create a session', () => {
  const session = login(users, 'ada', 'correct horse', 0);
  assert.equal(session.userId, 1);
});

test('wrong password or unknown user is rejected', () => {
  assert.equal(login(users, 'ada', 'wrong', 0), null);
  assert.equal(login(users, 'bob', 'correct horse', 0), null);
});
