import assert from 'node:assert/strict';
import test from 'node:test';

import { createApp } from '../src/app.js';

test('lists the seeded contacts', () => {
  const res = createApp()({ method: 'GET', url: '/contacts' });
  assert.equal(res.status, 200);
  assert.equal(JSON.parse(res.body).length, 4);
});

test('returns one contact by id', () => {
  const res = createApp()({ method: 'GET', url: '/contacts/2' });
  assert.equal(res.status, 200);
  assert.equal(JSON.parse(res.body).name, 'Grace Hopper');
});

test('unknown contact id is 404', () => {
  assert.equal(createApp()({ method: 'GET', url: '/contacts/99' }).status, 404);
});

test('creates a contact', () => {
  const handle = createApp();
  const res = handle({
    method: 'POST',
    url: '/contacts',
    body: JSON.stringify({ name: 'Mary Jackson', email: 'mjackson@example.net' }),
  });
  assert.equal(res.status, 201);
  assert.equal(JSON.parse(res.body).id, 5);
  assert.equal(JSON.parse(handle({ method: 'GET', url: '/contacts' }).body).length, 5);
});

test('rejects a contact without an email', () => {
  const res = createApp()({ method: 'POST', url: '/contacts', body: JSON.stringify({ name: 'No Email' }) });
  assert.equal(res.status, 400);
});
