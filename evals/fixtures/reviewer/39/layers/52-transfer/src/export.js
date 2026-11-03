import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';

import { COLUMNS, formatRow } from './csv.js';
import { transfer } from './io/transfer.js';

function* csvLines(records) {
  yield formatRow(COLUMNS);
  for (const record of records) yield formatRow(COLUMNS.map((column) => record[column]));
}

// Writes every record in the store as CSV to a file path or writable stream and
// resolves with the number of records written.
export async function exportRecords(store, destination) {
  const records = store.list();
  const output = typeof destination === 'string' ? createWriteStream(destination) : destination;
  await transfer(Readable.from(csvLines(records)), output);
  return records.length;
}
