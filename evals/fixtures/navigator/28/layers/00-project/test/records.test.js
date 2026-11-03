import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { RecordNotFound, readRecord } from '../src/records.js';

const dir = fileURLToPath(new URL('./data', import.meta.url));

test('reads a record by id', () => {
  assert.equal(readRecord(dir, 'sku-2001').quantity, 4);
});

test('a missing record raises RecordNotFound', () => {
  assert.throws(() => readRecord(dir, 'sku-9999'), RecordNotFound);
});
