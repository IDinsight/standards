import { seedRecords } from '@records/seed';

import { writeExport } from '../src/export.ts';
import { parseFilter } from '../src/records/filter.ts';
import { RecordStore } from '../src/records/store.ts';

// Writes a CSV export of the seed records from the command line.
//
//   node scripts/export-records.ts [status=<status>] [owner=<name>] [q=<text>] [--out <dir>] [--prefix <name>]
//
// Filters use the same names and validation as GET /records.

function parseArgs(argv: string[]) {
  const query: Record<string, string> = {};
  let out = 'exports';
  let prefix = 'records';
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--out') {
      index += 1;
      out = argv[index] ?? out;
    } else if (arg === '--prefix') {
      index += 1;
      prefix = argv[index] ?? prefix;
    } else {
      const [key, ...rest] = arg.split('=');
      query[key] = rest.join('=');
    }
  }
  return { query, out, prefix };
}

const { query, out, prefix } = parseArgs(process.argv.slice(2));
const store = new RecordStore(seedRecords);
const records = store.list(parseFilter(query));
const file = writeExport(out, records, new Date(), prefix);
console.log(`${records.length} records written to ${file.path}`);
