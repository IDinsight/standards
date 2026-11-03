import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildCsv } from '../src/export.ts';
import { MemorySource, type RecordItem } from '../src/records.ts';

const records: RecordItem[] = [
  { id: 3, title: 'Q2 "priority" accounts review', owner: 'dana', status: 'archived', createdAt: '2026-04-01T08:05:00Z' },
  { id: 1, title: 'Lease agreement, Building B', owner: 'dana', status: 'active', createdAt: '2026-03-02T10:15:00Z' },
  { id: 2, title: 'Vendor onboarding checklist', owner: 'li', status: 'active', createdAt: '2026-03-09T14:40:00Z' },
];

test('buildCsv writes the header and every record in id order', () => {
  assert.equal(
    buildCsv(new MemorySource(records)),
    'id,title,owner,status,createdAt\r\n'
      + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
      + '2,Vendor onboarding checklist,li,active,2026-03-09T14:40:00Z\r\n'
      + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n',
  );
});

test('buildCsv of an empty source is just the header', () => {
  assert.equal(buildCsv(new MemorySource([])), 'id,title,owner,status,createdAt\r\n');
});
