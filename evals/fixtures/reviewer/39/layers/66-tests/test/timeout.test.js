import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { test } from 'node:test';

import { DEFAULT_EXPORT_TIMEOUT_MS, TransferTimeoutError, exportRecords } from '../src/export.js';
import { RecordStore } from '../src/store.js';

const records = [
  { id: 1, title: 'Lease, Building B', owner: 'dana' },
  { id: 2, title: 'Vendor checklist', owner: 'li' },
];

// A destination that takes the first write and never acknowledges it, like a
// stalled network share.
function stalledDestination() {
  return new Writable({ write() {} });
}

function collector() {
  const chunks = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });
  return { stream, text: () => chunks.join('') };
}

test('an export that does not finish within the timeout fails with TransferTimeoutError', async () => {
  const started = Date.now();
  await assert.rejects(
    exportRecords(new RecordStore(records), stalledDestination(), { timeoutMs: 50 }),
    (error) => error instanceof TransferTimeoutError && error.timeoutMs === 50,
  );
  assert.ok(Date.now() - started < 1000);
});

test('the default export timeout is 30 seconds', () => {
  assert.equal(DEFAULT_EXPORT_TIMEOUT_MS, 30_000);
});

test('an export that finishes within the default timeout writes the same CSV', async () => {
  const out = collector();
  assert.equal(await exportRecords(new RecordStore(records), out.stream), 2);
  assert.equal(out.text(), 'id,title,owner\r\n1,"Lease, Building B",dana\r\n2,Vendor checklist,li\r\n');
});
