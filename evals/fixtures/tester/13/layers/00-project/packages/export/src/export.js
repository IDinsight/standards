import { writeFile } from 'node:fs/promises';

import { HEADER, recordLine } from './csv.js';
import { listRecords } from './records.js';

// Writes the records matching the filter to outputPath as CSV.
export async function exportRecords(db, filter, outputPath) {
  const records = await listRecords(db, filter);
  await writeFile(outputPath, HEADER + records.map(recordLine).join(''), 'utf8');
  return { path: outputPath, rowCount: records.length };
}
