import assert from 'node:assert/strict';
import test from 'node:test';

import { parseKeys } from '../src/auth.js';
import { createHandler } from '../src/router.js';
import { ExpenseStore } from '../src/store.js';
import { records } from './sample-records.js';

const keys = parseKeys('k-admin:u0:admin,k-ana:u1:member,k-ben:u2:member');
const setup = () => createHandler({ store: new ExpenseStore({ records }), keys });
const get = (handle, key, path, query = {}) => handle({
  method: 'GET', path, query, headers: key ? { 'x-api-key': key } : {},
});
const ids = (result) => JSON.parse(result.body).expenses.map((expense) => expense.id);

test('rejects requests without a key', () => {
  assert.equal(get(setup(), null, '/expenses').status, 401);
});

test('members see only their own expenses', () => {
  assert.deepEqual(ids(get(setup(), 'k-ana', '/expenses')), [3, 1]);
});

test('admins see everyone and can filter by owner', () => {
  const handle = setup();
  assert.deepEqual(ids(get(handle, 'k-admin', '/expenses')), [3, 2, 1]);
  assert.deepEqual(ids(get(handle, 'k-admin', '/expenses', { owner: 'u2' })), [2]);
});

test('members cannot read another member expense', () => {
  assert.equal(get(setup(), 'k-ana', '/expenses/2').status, 404);
});

test('creates an expense for the caller', () => {
  const result = setup()({
    method: 'POST',
    path: '/expenses',
    headers: { 'x-api-key': 'k-ana' },
    body: { date: '2026-08-04', merchant: 'Taxi Line', category: 'travel', amountCents: 1250 },
  });
  assert.equal(result.status, 201);
  const body = JSON.parse(result.body);
  assert.equal(body.ownerId, 'u1');
  assert.equal(body.amount, '12.50');
});

test('rejects invalid input', () => {
  const result = setup()({
    method: 'POST',
    path: '/expenses',
    headers: { 'x-api-key': 'k-ana' },
    body: { date: '2026-02-30', merchant: '', category: 'fuel', amountCents: 0 },
  });
  assert.equal(result.status, 400);
});
