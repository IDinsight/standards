import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../src/app.ts';
import type { User } from '../src/auth/users.ts';
import type { AppRequest } from '../src/http/messages.ts';
import { exportRecords } from './fixtures/export-records.ts';
import { parseCsv } from './helpers/csv.ts';

const root = mkdtempSync(path.join(tmpdir(), 'records-export-route-'));
after(() => rmSync(root, { recursive: true, force: true }));

const admin: User = { id: 1, name: 'Ada', role: 'admin' };
const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };
const fixedNow = () => new Date('2026-09-24T09:00:00Z');

function send(method: AppRequest['method'], routePath: string, query: Record<string, string>, user: User): AppRequest {
  return { method, path: routePath, query, user };
}

test('a status-filtered export writes exactly the records the listing returns', () => {
  const exportDir = path.join(root, 'archived');
  const app = createApp({ records: exportRecords, exportDir, now: fixedNow });
  const listed = JSON.parse(app.handle(send('GET', '/records', { status: 'archived' }, admin)).body).records;
  assert.ok(listed.length > 0);

  const response = app.handle(send('POST', '/records/export', { status: 'archived' }, admin));

  assert.equal(response.status, 201);
  const written = readFileSync(path.join(exportDir, 'records-20260924T090000Z.csv'), 'utf8');
  assert.equal(response.body, written);
  assert.ok(written.endsWith('\r\n'));
  assert.deepEqual(parseCsv(written), [
    ['id', 'title', 'owner', 'status', 'createdAt'],
    ...listed.map((record) => [String(record.id), record.title, record.owner, record.status, record.createdAt]),
  ]);
});

test('a viewer export is rejected before any export folder is created', () => {
  const exportDir = path.join(root, 'viewer');
  const app = createApp({ records: exportRecords, exportDir, now: fixedNow });

  const response = app.handle(send('POST', '/records/export', {}, viewer));

  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
  assert.equal(existsSync(exportDir), false);
});
