import assert from 'node:assert/strict';
import test from 'node:test';

import { SESSION_COOKIE, authenticate, csrfOk } from '../api/src/auth.js';
import { SessionStore } from '../api/src/sessions.js';
import { sign, unsign } from '../shared/signing.js';

test('unsign returns the value only for an untampered signature', () => {
  const signed = sign('abc', 'k');
  assert.equal(unsign(signed, 'k'), 'abc');
  assert.equal(unsign(signed, 'other'), null);
  assert.equal(unsign(`x${signed}`, 'k'), null);
  assert.equal(unsign('nodot', 'k'), null);
});

test('authenticate accepts only a correctly signed session cookie', () => {
  const config = { sessionSecret: 's' };
  const sessions = new SessionStore({ ttlSeconds: 60 });
  const session = sessions.create({ id: 1, role: 'member' });
  const good = { headers: { cookie: `theme=dark; ${SESSION_COOKIE}=${sign(session.id, 's')}` } };
  const forged = { headers: { cookie: `${SESSION_COOKIE}=${session.id}` } };
  assert.equal(authenticate(good, { sessions, config }).userId, 1);
  assert.equal(authenticate(forged, { sessions, config }), null);
  assert.equal(authenticate({ headers: {} }, { sessions, config }), null);
});

test('the CSRF token is required on writes only', () => {
  const session = { csrfToken: 't' };
  assert.equal(csrfOk({ method: 'GET', headers: {} }, session), true);
  assert.equal(csrfOk({ method: 'POST', headers: {} }, session), false);
  assert.equal(csrfOk({ method: 'POST', headers: { 'x-csrf-token': 't' } }, session), true);
});
