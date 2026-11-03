import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../src/app.ts';
import type { User } from '../src/auth/users.ts';
import type { AppRequest } from '../src/http/messages.ts';

// Each test writes into its own folder under a temporary root that is removed
// afterwards.
const root = mkdtempSync(path.join(tmpdir(), 'records-export-'));
after(() => rmSync(root, { recursive: true, force: true }));

const admin: User = { id: 1, name: 'Ada', role: 'admin' };
const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };
const fixedNow = () => new Date('2026-09-24T09:00:00Z');

function send(method: AppRequest['method'], route: string, query: Record<string, string>, user: User | null): AppRequest {
  return { method, path: route, query, user };
}

test('an administrator export writes the filtered records and returns a download link', () => {
  const exportDir = path.join(root, 'created');
  const response = createApp({ exportDir, now: fixedNow }).handle(send('POST', '/records/export', { owner: 'dana' }, admin));

  assert.equal(response.status, 201);
  assert.deepEqual(JSON.parse(response.body), {
    file: 'records-20260924T090000Z.csv',
    count: 2,
    url: '/exports/download?file=records-20260924T090000Z.csv',
  });
  assert.deepEqual(readdirSync(exportDir), ['records-20260924T090000Z.csv']);
});

test('the download link returns the CSV without signing in', () => {
  const exportDir = path.join(root, 'shared');
  const app = createApp({ exportDir, now: fixedNow });
  const { url } = JSON.parse(app.handle(send('POST', '/records/export', { owner: 'dana' }, admin)).body);
  const [route, search] = url.split('?');
  const response = app.handle(send('GET', route, Object.fromEntries(new URLSearchParams(search)), null));

  assert.equal(response.status, 200);
  assert.equal(response.headers['content-type'], 'text/csv; charset=utf-8');
  assert.equal(response.headers['content-disposition'], 'attachment; filename="records-20260924T090000Z.csv"');
  assert.equal(
    response.body,
    'id,title,owner,status,createdAt\r\n'
      + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
      + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n',
  );
});

test('a viewer cannot create an export', () => {
  const exportDir = path.join(root, 'denied');
  const response = createApp({ exportDir, now: fixedNow }).handle(send('POST', '/records/export', {}, viewer));

  assert.equal(response.status, 403);
  assert.equal(existsSync(exportDir), false);
});
