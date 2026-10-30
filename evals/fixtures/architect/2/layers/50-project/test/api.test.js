import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestApp, signIn } from './helpers.js';

const login = (handle, username, password) =>
  handle({ method: 'POST', path: '/login', headers: {}, body: { username, password } });

test('login sets an HttpOnly session cookie and returns a CSRF token', async () => {
  const { handle } = createTestApp();
  const response = await login(handle, 'ada', 'correct horse');
  assert.equal(response.status, 200);
  assert.match(response.headers['set-cookie'], /^tally_sid=[^;]+; Max-Age=1209600; Path=\/; HttpOnly; SameSite=Lax$/);
  assert.equal(typeof response.body.csrfToken, 'string');
  assert.deepEqual(response.body.user, { id: 1, username: 'ada', role: 'member' });
});

test('repeated wrong passwords are audited and then rate limited', async () => {
  const { handle, audit } = createTestApp();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    assert.equal((await login(handle, 'ada', 'nope')).status, 401);
  }
  assert.equal((await login(handle, 'ada', 'correct horse')).status, 429);
  assert.equal(audit.entries.filter((entry) => entry.event === 'login.failed').length, 5);
});

test('requests need a session, and writes need its CSRF token', async () => {
  const { handle } = createTestApp();
  assert.equal((await handle({ method: 'GET', path: '/expenses', headers: {} })).status, 401);
  const ada = await signIn(handle, 'ada', 'correct horse');
  const response = await handle({
    method: 'POST', path: '/expenses', headers: { cookie: ada.cookie },
    body: { amountCents: 500, category: 'meals', date: '2026-09-01' },
  });
  assert.equal(response.status, 403);
});

test('members see only their own expenses; admins see all', async () => {
  const { handle } = createTestApp();
  const ada = await signIn(handle, 'ada', 'correct horse');
  const grace = await signIn(handle, 'grace', 'battery staple');
  const post = (who, body) => handle({
    method: 'POST', path: '/expenses', headers: { cookie: who.cookie, 'x-csrf-token': who.csrfToken }, body,
  });
  assert.equal((await post(ada, { amountCents: 500, category: 'meals', date: '2026-09-01' })).status, 201);
  assert.equal((await post(grace, { amountCents: 700, category: 'travel', date: '2026-09-01' })).status, 201);
  const list = async (who) => (await handle({ method: 'GET', path: '/expenses', headers: { cookie: who.cookie } }))
    .body.map((expense) => expense.userId);
  assert.deepEqual(await list(ada), [1]);
  assert.deepEqual(await list(grace), [1, 2]);
});

test('only admins and the service account may post reports', async () => {
  const { handle } = createTestApp();
  const ada = await signIn(handle, 'ada', 'correct horse');
  const worker = await signIn(handle, 'report-worker', 'worker pass');
  const post = (who) => handle({
    method: 'POST', path: '/reports', headers: { cookie: who.cookie, 'x-csrf-token': who.csrfToken },
    body: { period: '2026-08', count: 0, totals: {} },
  });
  assert.equal((await post(ada)).status, 403);
  assert.equal((await post(worker)).status, 201);
});

test('logout ends the session and clears the cookie', async () => {
  const { handle, audit } = createTestApp();
  const ada = await signIn(handle, 'ada', 'correct horse');
  const out = await handle({ method: 'POST', path: '/logout', headers: { cookie: ada.cookie, 'x-csrf-token': ada.csrfToken } });
  assert.equal(out.status, 204);
  assert.match(out.headers['set-cookie'], /^tally_sid=; Max-Age=0;/);
  assert.equal((await handle({ method: 'GET', path: '/me', headers: { cookie: ada.cookie } })).status, 401);
  assert.ok(audit.entries.some((entry) => entry.event === 'logout' && entry.userId === 1));
});
