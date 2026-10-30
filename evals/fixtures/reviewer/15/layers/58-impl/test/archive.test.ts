import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ArchiveError, createHttpArchiveClient, type ArchiveClient } from '../src/archive/client.ts';
import { runArchiveExport } from '../src/archive/job.ts';
import { uploadWithRetry } from '../src/archive/retry.ts';
import { toCsv } from '../src/export/csv.ts';
import { RecordStore, type RecordItem } from '../src/records/store.ts';

// Each entry is the outcome of one upload attempt: 'ok', 'unreachable', or the
// HTTP status the archive answers with. Attempts past the list succeed.
type Outcome = 'ok' | 'unreachable' | number;

function fakeArchive(outcomes: Outcome[]) {
  const calls: { name: string; body: string }[] = [];
  const client: ArchiveClient = {
    async put(name, body) {
      calls.push({ name, body });
      const outcome = outcomes[calls.length - 1] ?? 'ok';
      if (outcome === 'unreachable') throw new ArchiveError('archive unreachable: fetch failed');
      if (typeof outcome === 'number') throw new ArchiveError(`archive responded ${outcome}`, outcome);
    },
  };
  return { client, calls };
}

function fakeSleep() {
  const waits: number[] = [];
  return { waits, sleep: async (ms: number) => { waits.push(ms); } };
}

test('uploads once when the archive accepts the file', async () => {
  const { client, calls } = fakeArchive(['ok']);
  const { waits, sleep } = fakeSleep();
  assert.deepEqual(await uploadWithRetry(client, 'records.csv', 'id\r\n', { sleep }), { attempts: 1 });
  assert.equal(calls.length, 1);
  assert.deepEqual(waits, []);
});

test('server errors are retried with doubling waits', async () => {
  const { client, calls } = fakeArchive([503, 502]);
  const { waits, sleep } = fakeSleep();
  assert.deepEqual(await uploadWithRetry(client, 'records.csv', 'id\r\n', { sleep }), { attempts: 3 });
  assert.equal(calls.length, 3);
  assert.deepEqual(waits, [500, 1000]);
});

test('throttled and unreachable attempts are retried', async () => {
  const { client } = fakeArchive([429, 'unreachable']);
  const { waits, sleep } = fakeSleep();
  assert.deepEqual(await uploadWithRetry(client, 'records.csv', 'id\r\n', { sleep }), { attempts: 3 });
  assert.deepEqual(waits, [500, 1000]);
});

test('other client errors are not retried', async () => {
  const { client, calls } = fakeArchive([403]);
  const { waits, sleep } = fakeSleep();
  await assert.rejects(uploadWithRetry(client, 'records.csv', 'id\r\n', { sleep }), { name: 'ArchiveError', status: 403 });
  assert.equal(calls.length, 1);
  assert.deepEqual(waits, []);
});

test('waits between attempts stop growing at 30 seconds', async () => {
  const { client } = fakeArchive([503, 503, 503, 503, 503, 503, 503, 503]);
  const { waits, sleep } = fakeSleep();
  assert.deepEqual(await uploadWithRetry(client, 'records.csv', 'id\r\n', { sleep }), { attempts: 9 });
  assert.deepEqual(waits, [500, 1000, 2000, 4000, 8000, 16000, 30000, 30000]);
});

test('runArchiveExport uploads every record as one CSV file', async () => {
  const records: RecordItem[] = [
    { id: 2, title: 'Vendor checklist', owner: 'li', status: 'active', createdAt: '2026-01-05T09:00:00Z' },
    { id: 1, title: 'Lease agreement, Building B', owner: 'dana', status: 'active', createdAt: '2026-01-02T09:00:00Z' },
  ];
  const store = new RecordStore(records);
  const { client, calls } = fakeArchive([]);
  const result = await runArchiveExport({ store, archive: client, now: () => new Date('2026-09-24T09:00:00Z') });

  assert.deepEqual(result, { fileName: 'records-20260924T090000Z.csv', records: 2, attempts: 1 });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, 'records-20260924T090000Z.csv');
  assert.equal(calls[0].body, toCsv(store.list()));
  assert.ok(calls[0].body.startsWith('id,title,owner,status,createdAt\r\n1,"Lease agreement, Building B"'));
});

test('the HTTP client sends a PUT with the token and CSV content type', async () => {
  const requests: { url: string; init: RequestInit | undefined }[] = [];
  const client = createHttpArchiveClient({
    baseUrl: 'https://archive.example/api/',
    token: 'secret-token',
    fetch: async (url, init) => {
      requests.push({ url: String(url), init });
      return new Response(null, { status: 201 });
    },
  });
  await client.put('records-20260924T090000Z.csv', 'id\r\n');

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://archive.example/api/exports/records-20260924T090000Z.csv');
  assert.equal(requests[0].init?.method, 'PUT');
  assert.deepEqual(requests[0].init?.headers, {
    authorization: 'Bearer secret-token',
    'content-type': 'text/csv; charset=utf-8',
  });
  assert.equal(requests[0].init?.body, 'id\r\n');
});

test('the HTTP client reports a non-success response with its status', async () => {
  const client = createHttpArchiveClient({
    baseUrl: 'https://archive.example',
    token: 't',
    fetch: async () => new Response('busy', { status: 503 }),
  });
  await assert.rejects(client.put('records.csv', 'id\r\n'), {
    name: 'ArchiveError',
    status: 503,
    message: 'archive responded 503',
  });
});

test('the HTTP client reports an unreachable archive without a status', async () => {
  const client = createHttpArchiveClient({
    baseUrl: 'https://archive.example',
    token: 't',
    fetch: async () => {
      throw new TypeError('fetch failed');
    },
  });
  await assert.rejects(client.put('records.csv', 'id\r\n'), {
    name: 'ArchiveError',
    status: undefined,
    message: 'archive unreachable: fetch failed',
  });
});
