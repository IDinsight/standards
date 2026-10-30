import assert from 'node:assert/strict';
import test from 'node:test';

import { createApp } from '../src/app.js';
import { createUserStore } from '../src/users.js';

const newApp = () => createApp({ users: createUserStore() });

test('GET /health reports ok', () => {
  const response = newApp()({ method: 'GET', path: '/health', headers: {} });
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(response.body), { ok: true });
});

test('POST /users registers a user', () => {
  const response = newApp()({
    method: 'POST', path: '/users', headers: {}, body: { username: 'Ada', password: 'correct horse' },
  });
  assert.equal(response.status, 201);
  assert.deepEqual(JSON.parse(response.body), { id: 1, username: 'ada' });
});

test('POST /users rejects a duplicate username', () => {
  const app = newApp();
  const body = { username: 'ada', password: 'correct horse' };
  app({ method: 'POST', path: '/users', headers: {}, body });
  const response = app({ method: 'POST', path: '/users', headers: {}, body });
  assert.equal(response.status, 400);
  assert.match(JSON.parse(response.body).error, /taken/);
});

test('unknown routes return 404', () => {
  assert.equal(newApp()({ method: 'GET', path: '/nope', headers: {} }).status, 404);
});
