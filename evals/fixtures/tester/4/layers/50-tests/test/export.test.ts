import assert from 'node:assert/strict';
import { test } from 'node:test';

import { toCsv } from '../src/export.ts';
import { parseCsv } from '../src/parse-csv.ts';
import type { RecordItem } from '../src/store.ts';

const record = (id: number, title: string): RecordItem => ({ id, title, owner: 'dana', status: 'active', createdAt: '2026-03-02T10:15:00Z' });

test('toCsv writes the header and one CRLF-terminated row per record', () => {
  assert.equal(
    toCsv([record(1, 'Lease agreement'), record(2, 'Vendor checklist')]),
    'id,title,owner,status,createdAt\r\n1,Lease agreement,dana,active,2026-03-02T10:15:00Z\r\n2,Vendor checklist,dana,active,2026-03-02T10:15:00Z\r\n',
  );
});

test('a title with a bare carriage return is quoted', () => {
  assert.equal(toCsv([record(8, 'Line one\rLine two')]).split('\r\n')[1], '8,"Line one\rLine two",dana,active,2026-03-02T10:15:00Z');
});

test('a title with commas and quotes reads back unchanged', () => {
  const title = 'Q2 "priority" accounts, review';
  assert.deepEqual(parseCsv(toCsv([record(3, title)]))[1], ['3', title, 'dana', 'active', '2026-03-02T10:15:00Z']);
});
