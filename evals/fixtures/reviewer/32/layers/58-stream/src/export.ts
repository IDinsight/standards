import { once } from 'node:events';
import type { Writable } from 'node:stream';
import { finished } from 'node:stream/promises';

import { CSV_HEADER, csvRow } from './csv.ts';
import type { RecordSource } from './records.ts';

export const DEFAULT_BATCH_SIZE = 1000;

// Header chunk first, then one chunk per batch of records read through
// source.page, so only one batch of rendered rows exists at a time.
export function* csvChunks(source: RecordSource, batchSize: number = DEFAULT_BATCH_SIZE): Generator<string> {
  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new RangeError(`batch size must be a positive integer, got ${batchSize}`);
  }
  yield CSV_HEADER;
  const total = source.count();
  for (let offset = 0; offset < total; offset += batchSize) {
    let chunk = '';
    for (const record of source.page(offset, batchSize)) chunk += csvRow(record);
    yield chunk;
  }
}

// Writes the export to out, waiting for 'drain' whenever its buffer is full.
// Ends the stream and resolves with the number of bytes written once it finishes.
export async function writeCsv(source: RecordSource, out: Writable, batchSize: number = DEFAULT_BATCH_SIZE): Promise<number> {
  let bytes = 0;
  for (const chunk of csvChunks(source, batchSize)) {
    bytes += Buffer.byteLength(chunk);
    if (!out.write(chunk)) await once(out, 'drain');
  }
  out.end();
  await finished(out);
  return bytes;
}

// Whole export as one string, for small record sets.
export function buildCsv(source: RecordSource): string {
  return [...csvChunks(source)].join('');
}
