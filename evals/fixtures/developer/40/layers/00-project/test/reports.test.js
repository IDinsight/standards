import assert from 'node:assert/strict';
import test from 'node:test';

import { RecordStore } from '../src/records.js';
import { renderReportsPage, reportRows } from '../src/reports.js';

test('reportRows counts open and closed records per owner', () => {
  const store = new RecordStore();
  store.create({ title: 'A', owner: 'lee', status: 'open' });
  store.create({ title: 'B', owner: 'kim', status: 'closed' });
  store.create({ title: 'C', owner: 'kim', status: 'open' });
  assert.deepEqual(reportRows(store), [
    { owner: 'kim', open: 1, closed: 1 },
    { owner: 'lee', open: 1, closed: 0 },
  ]);
});

test('renderReportsPage escapes owner names', () => {
  const html = renderReportsPage([{ owner: '<script>', open: 0, closed: 2 }]);
  assert.ok(html.includes('<td>&lt;script&gt;</td><td>0</td><td>2</td>'));
});
