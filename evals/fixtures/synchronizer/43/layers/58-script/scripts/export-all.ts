// Writes every record to a CSV file for the nightly copy to the shared
// reports drive.
//
//   node scripts/export-all.ts [folder]
//
// The folder defaults to `exports`, the same folder the export route uses.
import { seedRecords } from '@records/seed';

import { writeExport } from '../src/export.ts';
import { RecordStore } from '../src/records/store.ts';

const dir = process.argv[2] ?? 'exports';
const store = new RecordStore(seedRecords);
const file = writeExport(dir, store.list(), new Date());
console.log('Wrote ' + file.path);
