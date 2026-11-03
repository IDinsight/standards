import assert from 'node:assert/strict';
import test from 'node:test';

import { ReportStore } from '../src/store.js';

test('create assigns increasing ids', () => {
  const store = new ReportStore();
  const first = store.create({ workspaceId: 1, ownerId: 10, title: 'Q3 revenue' });
  const second = store.create({ workspaceId: 1, ownerId: 10, title: 'Q3 churn' });
  assert.equal(first.id, 1);
  assert.equal(second.id, 2);
  assert.deepEqual(store.get(2), second);
});

test('listForWorkspace returns only that workspace', () => {
  const store = new ReportStore();
  store.create({ workspaceId: 1, ownerId: 10, title: 'Q3 revenue' });
  store.create({ workspaceId: 2, ownerId: 20, title: 'Hiring plan' });
  assert.deepEqual(store.listForWorkspace(2).map((report) => report.title), ['Hiring plan']);
});

test('get returns null for an unknown id', () => {
  assert.equal(new ReportStore().get(42), null);
});
