import assert from 'node:assert/strict';
import test from 'node:test';

import { sign, verifySession } from '../src/session.js';

const keys = { k1: 'test-secret-one' };

test('round trip returns the claims', () => {
  const token = sign({ sub: 'acct-7' }, keys, 'k1');
  assert.deepEqual(verifySession(token, keys), { sub: 'acct-7' });
});

test('a tampered payload is rejected', () => {
  const token = sign({ sub: 'acct-7' }, keys, 'k1');
  const [head, , signature] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ sub: 'acct-1' })).toString('base64url');
  assert.throws(() => verifySession(`${head}.${forged}.${signature}`, keys));
});
