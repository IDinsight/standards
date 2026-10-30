import assert from 'node:assert/strict';
import test from 'node:test';

import { ReportStore } from '../src/store.js';

test('assigns increasing string ids', () => {
  const store = new ReportStore();
  assert.equal(store.create('ana', 'A', []).id, '1');
  assert.equal(store.create('ana', 'B', []).id, '2');
});

test('returns null for an unknown report', () => {
  assert.equal(new ReportStore().get('9'), null);
});

test('lists reports by owner', () => {
  const store = new ReportStore();
  store.create('ana', 'A', []);
  store.create('ben', 'B', []);
  store.create('ana', 'C', []);
  assert.deepEqual(store.listByOwner('ana').map((report) => report.title), ['A', 'C']);
});
