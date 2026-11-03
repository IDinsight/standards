import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../../src/app.ts';
import type { User } from '../../src/auth/users.ts';
import type { AppRequest } from '../../src/http/messages.ts';

// Runs the export end to end against the seeded app, writing into a
// temporary folder that is removed afterwards.
const root = mkdtempSync(path.join(tmpdir(), 'records-export-'));
after(() => rmSync(root, { recursive: true, force: true }));

const admin: User = { id: 1, name: 'Ada', role: 'admin', tenantId: 'northwind' };
const fixedNow = () => new Date('2026-09-24T09:00:00Z');

function exportRequest(query: Record<string, string>): AppRequest {
  return { method: 'POST', path: '/records/export', query, user: admin };
}

function rowIds(csv: string): string[] {
  return csv.trimEnd().split('\r\n').slice(1).map((row) => row.split(',')[0]);
}

test('an administrator exports the filtered records to a CSV file', () => {
  const exportDir = path.join(root, 'by-owner');
  const response = createApp({ exportDir, now: fixedNow }).handle(exportRequest({ owner: 'dana' }));

  assert.equal(response.status, 201);
  assert.equal(response.headers['content-type'], 'text/csv; charset=utf-8');
  assert.equal(response.headers['content-disposition'], 'attachment; filename="records-20260924T090000Z.csv"');
  const written = readFileSync(path.join(exportDir, 'records-20260924T090000Z.csv'), 'utf8');
  assert.equal(
    written,
    'id,title,owner,status,createdAt\r\n'
      + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
      + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n',
  );
  assert.equal(response.body, written);
});

test('an export applies the title search', () => {
  const exportDir = path.join(root, 'search');
  const response = createApp({ exportDir, now: fixedNow }).handle(exportRequest({ q: 'lease' }));

  assert.equal(response.status, 201);
  assert.deepEqual(rowIds(response.body), ['1']);
});
