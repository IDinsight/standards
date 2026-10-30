import assert from 'node:assert/strict';
import test from 'node:test';

import { createApi } from '../api/routes.js';
import { SessionStore } from '../shared/session.js';

const accounts = [
  { id: 1, email: 'ada@example.org', password: 'correct horse', scopes: ['profile:read'] },
  { id: 2, email: 'worker@example.org', password: 'batch-runner', scopes: ['jobs:write'] },
];

const users = {
  authenticate: (email, password) =>
    accounts.find((account) => account.email === email && account.password === password) ?? null,
};

function setup() {
  const store = new SessionStore();
  const jobs = [];
  return { jobs, handle: createApi({ store, users, jobs }) };
}

function login(handle, email, password) {
  return handle({ method: 'POST', path: '/login', body: { email, password } });
}

const cookieFrom = (response) => response.headers['set-cookie'].split(';')[0];

test('login issues a session cookie that authenticates later requests', () => {
  const { handle } = setup();
  const response = login(handle, 'ada@example.org', 'correct horse');
  assert.equal(response.status, 204);
  const me = handle({ method: 'GET', path: '/me', headers: { cookie: cookieFrom(response) } });
  assert.deepEqual([me.status, me.body], [200, { userId: 1 }]);
});

test('a wrong password is rejected', () => {
  const { handle } = setup();
  assert.equal(login(handle, 'ada@example.org', 'nope').status, 401);
});

test('requests without a session are rejected', () => {
  const { handle } = setup();
  assert.equal(handle({ method: 'GET', path: '/me' }).status, 401);
  assert.equal(handle({ method: 'GET', path: '/me', headers: { cookie: 'sid=unknown' } }).status, 401);
});

test('job completion requires the jobs:write scope', () => {
  const { handle, jobs } = setup();
  const member = cookieFrom(login(handle, 'ada@example.org', 'correct horse'));
  const worker = cookieFrom(login(handle, 'worker@example.org', 'batch-runner'));
  const request = (cookie) => handle({ method: 'POST', path: '/jobs/complete', headers: { cookie }, body: { jobId: 'job-7' } });
  assert.equal(request(member).status, 403);
  assert.equal(request(worker).status, 204);
  assert.deepEqual(jobs, ['job-7']);
});
