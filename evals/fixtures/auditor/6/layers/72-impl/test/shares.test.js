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

function createAndShare(app, token) {
  const report = app({ method: 'POST', path: '/reports', headers: auth(token), body: { title: 'Q3', rows: [['a', '1']] } }).body;
  const share = app({ method: 'POST', path: `/reports/${report.id}/share`, headers: auth(token) });
  return { report, share };
}

test('owner can share a report that opens without signing in', () => {
  const { app, signIn } = setup();
  const { share } = createAndShare(app, signIn('ana'));
  assert.equal(share.status, 201);
  const opened = app({ method: 'GET', path: share.body.url });
  assert.deepEqual(opened, { status: 200, body: { id: '1', title: 'Q3', rows: [['a', '1']] } });
});

test('shared link stops working after 7 days', () => {
  const { app, signIn, advance } = setup();
  const { share } = createAndShare(app, signIn('ana'));
  advance(7 * DAY);
  assert.equal(app({ method: 'GET', path: share.body.url }).status, 404);
});

test('only the owner can share a report', () => {
  const { app, signIn } = setup();
  const { report } = createAndShare(app, signIn('ana'));
  const attempt = app({ method: 'POST', path: `/reports/${report.id}/share`, headers: auth(signIn('ben')) });
  assert.equal(attempt.status, 404);
});

test('a share token is not accepted as a session', () => {
  const { app, signIn } = setup();
  const { report, share } = createAndShare(app, signIn('ana'));
  const shareToken = share.body.url.slice('/shared/'.length);
  assert.equal(app({ method: 'GET', path: `/reports/${report.id}`, headers: auth(shareToken) }).status, 401);
});

test('a session token does not open a shared report', () => {
  const { app, signIn } = setup();
  const token = signIn('ana');
  createAndShare(app, token);
  assert.equal(app({ method: 'GET', path: `/shared/${token}` }).status, 404);
});
