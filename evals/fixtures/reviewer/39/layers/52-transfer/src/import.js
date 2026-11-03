import { createReadStream } from 'node:fs';
import { Writable } from 'node:stream';

import { parseCsv } from './csv.js';
import { transfer } from './io/transfer.js';

// Reads CSV from a file path or readable stream and adds every row to the
// store. Resolves with the number of records imported.
export async function importRecords(source, store) {
  const input = typeof source === 'string' ? createReadStream(source, { encoding: 'utf8' }) : source;
  let text = '';
  let count = 0;
  const sink = new Writable({
    decodeStrings: false,
    write(chunk, _encoding, callback) {
      text += chunk.toString();
      callback();
    },
    final(callback) {
      try {
        const rows = parseCsv(text);
        for (const row of rows) store.add(row);
        count = rows.length;
        callback();
      } catch (error) {
        callback(error);
      }
    },
  });
  await transfer(input, sink);
  return count;
}
