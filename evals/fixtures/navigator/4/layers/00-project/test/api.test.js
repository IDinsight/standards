import assert from 'node:assert/strict';
import test from 'node:test';

import { createApp } from '../src/app.js';

test('created reminders are listed and delivered by a manual tick', async () => {
  const sent = [];
  const app = createApp({
    env: { REMINDR_FROM: 'team@example.org' },
    transport: (message) => { sent.push(message); },
    now: () => Date.UTC(2026, 0, 2),
  });
  const created = await app.api.handle({
    method: 'POST',
    path: '/reminders',
    body: { to: 'ada@x.org', text: 'Renew domain', dueAt: '2026-01-01T09:00:00Z' },
  });
  assert.equal(created.status, 201);
  assert.equal((await app.api.handle({ method: 'GET', path: '/reminders' })).body.length, 1);
  assert.deepEqual((await app.api.handle({ method: 'POST', path: '/tick' })).body, { sent: 1 });
  assert.deepEqual(sent, [{ from: 'team@example.org', to: 'ada@x.org', subject: 'Reminder', text: 'Renew domain' }]);
});

test('invalid input is rejected', async () => {
  const app = createApp({ env: {}, transport: () => {} });
  const missing = await app.api.handle({ method: 'POST', path: '/reminders', body: { to: 'a@x.org' } });
  assert.equal(missing.status, 400);
  const badDate = await app.api.handle({
    method: 'POST',
    path: '/reminders',
    body: { to: 'a@x.org', text: 't', dueAt: 'soon' },
  });
  assert.equal(badDate.status, 400);
});
