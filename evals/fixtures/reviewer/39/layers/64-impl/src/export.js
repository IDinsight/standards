import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';

import { COLUMNS, formatRow } from './csv.js';
import { transfer } from './io/transfer.js';

export { TransferTimeoutError } from './io/transfer.js';

export const DEFAULT_EXPORT_TIMEOUT_MS = 30_000;

function* csvLines(records) {
  yield formatRow(COLUMNS);
  for (const record of records) yield formatRow(COLUMNS.map((column) => record[column]));
}

// Writes every record in the store as CSV to a file path or writable stream and
// resolves with the number of records written. Rejects with
// TransferTimeoutError when the destination has not taken the whole export
// within timeoutMs.
export async function exportRecords(store, destination, { timeoutMs = DEFAULT_EXPORT_TIMEOUT_MS } = {}) {
  const records = store.list();
  const output = typeof destination === 'string' ? createWriteStream(destination) : destination;
  await transfer(Readable.from(csvLines(records)), output, { timeoutMs });
  return records.length;
}
