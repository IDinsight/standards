import assert from 'node:assert/strict';
import test from 'node:test';

import { createApiClient } from '../web/src/api-client.js';
import { connect, createTestApp } from './helpers.js';

const baseUrl = 'https://api.tallyhub.test';

test('the web client sends the session cookie and CSRF token on writes', async () => {
  const { handle, expenses } = createTestApp();
  const client = createApiClient({ baseUrl, fetch: connect(handle, { jar: {} }) });
  await client.login('ada', 'correct horse');
  const created = await client.addExpense({ amountCents: 1250, category: 'travel', date: '2026-09-02' });
  assert.equal(created.userId, 1);
  assert.equal(expenses.length, 1);
  assert.deepEqual((await client.listExpenses()).map((expense) => expense.id), [1]);
});

test('a reloaded page restores the signed-in session from the cookie', async () => {
  const { handle } = createTestApp();
  const jar = {};
  await createApiClient({ baseUrl, fetch: connect(handle, { jar }) }).login('ada', 'correct horse');
  const reloaded = createApiClient({ baseUrl, fetch: connect(handle, { jar }) });
  const me = await reloaded.restore();
  assert.equal(me.id, 1);
  const created = await reloaded.addExpense({ amountCents: 300, category: 'meals', date: '2026-09-03' });
  assert.equal(created.userId, 1);
});

test('the web client reports an expired session', async () => {
  const { handle, clock, config } = createTestApp();
  let signedOut = 0;
  const client = createApiClient({
    baseUrl, fetch: connect(handle, { jar: {} }), onUnauthorized: () => { signedOut += 1; },
  });
  await client.login('ada', 'correct horse');
  clock.value += (config.sessionTtlSeconds + 1) * 1000;
  await assert.rejects(client.listExpenses(), { status: 401 });
  assert.equal(signedOut, 1);
});
