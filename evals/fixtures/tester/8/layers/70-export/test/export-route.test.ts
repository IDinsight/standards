import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createApp } from '../src/app.ts';
import { createArchiveClient, type ArchiveRequest, type ArchiveResponse } from '../src/archive.ts';
import type { User } from '../src/auth/users.ts';
import type { AppRequest } from '../src/http/messages.ts';

const admin: User = { id: 1, name: 'Ada', role: 'admin' };
const editor: User = { id: 2, name: 'Eli', role: 'editor' };
const fixedNow = () => new Date('2026-09-24T09:00:00Z');
const location = 'http://archive.test/files/records-20260924T090000Z.csv';

type Reply = (request: ArchiveRequest) => Promise<ArchiveResponse>;

const stored: Reply = async () => ({ status: 201, json: async () => ({ location }) });
const unavailable: Reply = async () => ({ status: 503, json: async () => ({ error: 'maintenance' }) });
const refused: Reply = async () => ({ status: 400, json: async () => ({ error: 'invalid name' }) });
// Never answers; rejects once the client abandons the request.
const silent: Reply = (request) => new Promise((_, reject) => {
  request.signal.addEventListener('abort', () => reject(request.signal.reason));
});

// Stand-in for the archive: answers the nth upload with the nth reply (the last
// reply repeats) and records every request.
function fakeArchive(replies: Reply[]) {
  const calls: { url: string; request: ArchiveRequest }[] = [];
  const client = createArchiveClient('http://archive.test', (url, request) => {
    calls.push({ url, request });
    return replies[Math.min(calls.length, replies.length) - 1](request);
  });
  return { calls, client };
}

function exportRequest(query: Record<string, string>, user: User | null = admin): AppRequest {
  return { method: 'POST', path: '/records/export', query, user };
}

test('an administrator exports the filtered records to the archive', async () => {
  const archive = fakeArchive([stored]);
  const app = createApp({ archive: archive.client, now: fixedNow });
  const response = await app.handle(exportRequest({ owner: 'dana' }));

  assert.equal(response.status, 201);
  assert.deepEqual(JSON.parse(response.body), { fileName: 'records-20260924T090000Z.csv', location, count: 2 });
  assert.equal(archive.calls.length, 1);
  assert.equal(archive.calls[0].url, location);
  assert.equal(archive.calls[0].request.method, 'PUT');
  assert.equal(archive.calls[0].request.headers['content-type'], 'text/csv; charset=utf-8');
  assert.equal(
    archive.calls[0].request.body,
    'id,title,owner,status,createdAt\r\n'
      + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
      + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n',
  );
});

test('an export without a signed-in user is rejected before the archive is contacted', async () => {
  const archive = fakeArchive([stored]);
  const response = await createApp({ archive: archive.client }).handle(exportRequest({}, null));
  assert.equal(response.status, 401);
  assert.equal(archive.calls.length, 0);
});

test('non-administrators cannot export', async () => {
  const archive = fakeArchive([stored]);
  const response = await createApp({ archive: archive.client }).handle(exportRequest({}, editor));
  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
  assert.equal(archive.calls.length, 0);
});

test('an upload that fails with 503 is sent again', async () => {
  const archive = fakeArchive([unavailable, stored]);
  const app = createApp({ archive: archive.client, now: fixedNow, retryDelayMs: 0 });
  const response = await app.handle(exportRequest({ status: 'active' }));
  assert.equal(response.status, 201);
  assert.equal(archive.calls.length, 2);
  assert.equal(JSON.parse(response.body).count, 4);
});

test('an archive that does not answer within the time limit gives 504', async () => {
  const archive = fakeArchive([silent]);
  const app = createApp({ archive: archive.client, now: fixedNow, exportTimeoutMs: 20, retryDelayMs: 0 });
  const response = await app.handle(exportRequest({}));
  assert.equal(response.status, 504);
  assert.deepEqual(JSON.parse(response.body), { error: 'export did not complete' });
  assert.equal(archive.calls.length, 1);
});

test('an archive that refuses the file gives 502', async () => {
  const archive = fakeArchive([refused]);
  const app = createApp({ archive: archive.client, now: fixedNow, retryDelayMs: 0 });
  const response = await app.handle(exportRequest({}));
  assert.equal(response.status, 502);
  assert.deepEqual(JSON.parse(response.body), { error: 'archive rejected the export: archive responded 400' });
  assert.equal(archive.calls.length, 1);
});
