// Writes the records matching the given filters as CSV, to standard output or
// to a file.
//
//   node scripts/export-records.ts [--status active|archived] [--owner <name>]
//     [--q <text>] [--columns <name,...>] [--out <file>]
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { seedRecords } from '@records/seed';

import { DEFAULT_COLUMNS, parseColumns, toCsv } from '../src/export.ts';
import { parseFilter } from '../src/records/filter.ts';
import { RecordStore } from '../src/records/store.ts';

const OPTIONS = {
  status: { type: 'string' },
  owner: { type: 'string' },
  q: { type: 'string' },
  columns: { type: 'string' },
  out: { type: 'string' },
} as const;

function fail(message: string, code: number): number {
  process.stderr.write(`export-records: ${message}\n`);
  return code;
}

function main(args: string[]): number {
  let csv: string;
  let count: number;
  let out: string | undefined;
  try {
    const { values } = parseArgs({ args, options: OPTIONS, strict: true });
    const query: Record<string, string> = {};
    for (const name of ['status', 'owner', 'q'] as const) {
      const value = values[name];
      if (value !== undefined) query[name] = value;
    }
    const columns = values.columns === undefined ? DEFAULT_COLUMNS : parseColumns(values.columns);
    const records = new RecordStore(seedRecords).list(parseFilter(query));
    csv = toCsv(records, columns);
    count = records.length;
    out = values.out;
  } catch (error) {
    return fail((error as Error).message, 2);
  }
  if (out === undefined) {
    process.stdout.write(csv);
    return 0;
  }
  try {
    writeFileSync(out, csv, 'utf8');
  } catch (error) {
    return fail(`cannot write ${out}: ${(error as Error).message}`, 1);
  }
  process.stderr.write(`Wrote ${count} record${count === 1 ? '' : 's'} to ${out}\n`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
