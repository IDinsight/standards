import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { ReportStore } from '../src/store.js';

test('assigns sequential ids', () => {
  const store = new ReportStore();
  assert.equal(store.create({ ownerId: 'u1', title: 'A', body: '' }).id, '1');
  assert.equal(store.create({ ownerId: 'u1', title: 'B', body: '' }).id, '2');
});

test('returns null for an unknown report', () => {
  assert.equal(new ReportStore().get('9'), null);
});

test('lists only the owner\'s reports', () => {
  const store = new ReportStore();
  store.create({ ownerId: 'u1', title: 'A', body: '' });
  store.create({ ownerId: 'u2', title: 'B', body: '' });
  assert.deepEqual(store.listByOwner('u1').map((report) => report.title), ['A']);
});

test('reloads saved reports from its file', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'reports-')), 'reports.json');
  new ReportStore(file).create({ ownerId: 'u1', title: 'Q3', body: 'numbers' });
  const reopened = new ReportStore(file);
  assert.equal(reopened.get('1').title, 'Q3');
  assert.equal(reopened.create({ ownerId: 'u1', title: 'Q4', body: '' }).id, '2');
});
