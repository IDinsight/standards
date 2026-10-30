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
