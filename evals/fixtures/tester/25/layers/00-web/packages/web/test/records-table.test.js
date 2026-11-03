import assert from 'node:assert/strict';
import { test } from 'node:test';

import { renderRecordsTable } from '../src/records-table.js';
import { createDocument, descendants, getByRole } from './support/dom.js';

const records = [
  { id: 1, title: 'Lease agreement, Building B', owner: 'dana', status: 'active', createdAt: '2026-03-02T10:15:00Z' },
  { id: 3, title: 'Q2 accounts review', owner: 'dana', status: 'archived', createdAt: '2026-04-01T08:05:00Z' },
];

test('the table caption counts the records', () => {
  const document = createDocument();
  document.body.append(renderRecordsTable(document, records));
  const table = getByRole(document.body, 'table');
  assert.equal(descendants(table).find((element) => element.tagName === 'CAPTION').textContent, '2 records');
});

test('each record is a row under column headers', () => {
  const document = createDocument();
  const table = renderRecordsTable(document, records);
  const headers = descendants(table).filter((element) => element.tagName === 'TH');
  assert.deepEqual(headers.map((header) => header.textContent), ['ID', 'Title', 'Owner', 'Status', 'Created']);
  assert.ok(headers.every((header) => header.getAttribute('scope') === 'col'));
  const rows = descendants(table).filter((element) => element.tagName === 'TR').slice(1);
  assert.deepEqual(rows.map((row) => row.children.map((cell) => cell.textContent)), [
    ['1', 'Lease agreement, Building B', 'dana', 'active', '2026-03-02'],
    ['3', 'Q2 accounts review', 'dana', 'archived', '2026-04-01'],
  ]);
});
