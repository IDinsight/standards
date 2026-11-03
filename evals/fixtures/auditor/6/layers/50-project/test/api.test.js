import assert from 'node:assert/strict';
import test from 'node:test';

import { createApp } from '../src/api.js';
import { ReportStore } from '../src/store.js';

const DAY = 24 * 60 * 60 * 1000;

function setup() {
  let clock = 1_000;
  const app = createApp({
    store: new ReportStore(),
    users: new Map([['ana', 'pw-ana'], ['ben', 'pw-ben']]),
    secret: 'test-secret',
    now: () => clock,
  });
  const signIn = (userId) => app({ method: 'POST', path: '/sessions', body: { userId, password: `pw-${userId}` } }).body.token;
  return { app, signIn, advance: (ms) => { clock += ms; } };
}

const auth = (token) => ({ authorization: `Bearer ${token}` });

test('rejects wrong credentials', () => {
  const { app } = setup();
  const result = app({ method: 'POST', path: '/sessions', body: { userId: 'ana', password: 'nope' } });
  assert.equal(result.status, 401);
});

test('owner can create and read a report', () => {
  const { app, signIn } = setup();
  const token = signIn('ana');
  const created = app({ method: 'POST', path: '/reports', headers: auth(token), body: { title: 'Q3', rows: [['a', '1']] } });
  assert.equal(created.status, 201);
  const read = app({ method: 'GET', path: `/reports/${created.body.id}`, headers: auth(token) });
  assert.deepEqual(read, { status: 200, body: { id: '1', ownerId: 'ana', title: 'Q3', rows: [['a', '1']] } });
});

test('other users get 404 for a report they do not own', () => {
  const { app, signIn } = setup();
  const created = app({ method: 'POST', path: '/reports', headers: auth(signIn('ana')), body: { title: 'Q3' } });
  const read = app({ method: 'GET', path: `/reports/${created.body.id}`, headers: auth(signIn('ben')) });
  assert.equal(read.status, 404);
});

test('requests without a valid session get 401', () => {
  const { app } = setup();
  assert.equal(app({ method: 'GET', path: '/reports/1' }).status, 401);
  assert.equal(app({ method: 'GET', path: '/reports/1', headers: auth('not-a-token') }).status, 401);
});

test('sessions expire after 30 days', () => {
  const { app, signIn, advance } = setup();
  const token = signIn('ana');
  advance(30 * DAY);
  assert.equal(app({ method: 'GET', path: '/reports/1', headers: auth(token) }).status, 401);
});
