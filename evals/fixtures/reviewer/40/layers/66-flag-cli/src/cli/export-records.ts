import { realpathSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { seedRecords } from '@records/seed';

import { writeExport } from '../export.ts';
import { HttpError } from '../http/errors.ts';
import { parseFilter } from '../records/filter.ts';
import { RecordStore, type RecordItem } from '../records/store.ts';

const USAGE = 'Usage: node src/cli/export-records.ts [--status <active|archived>] [--owner <name>] [--q <text>] [--dir <folder>]';

export type CliOptions = {
  records?: readonly RecordItem[];
  now?: () => Date;
};

export type CliResult = {
  code: number;
  output: string;
};

// Writes the records matching the listing filters to a CSV file in the given
// folder, exactly as POST /records/export does, for operators with a shell on
// the service host.
export function runExportRecords(args: string[], options: CliOptions = {}): CliResult {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      options: {
        status: { type: 'string' },
        owner: { type: 'string' },
        q: { type: 'string' },
        dir: { type: 'string' },
      },
      strict: true,
      allowPositionals: false,
    });
  } catch (error) {
    return { code: 2, output: `${(error as Error).message}\n${USAGE}` };
  }

  const { dir, ...filters } = parsed.values;
  const query: Record<string, string> = {};
  for (const [name, value] of Object.entries(filters)) {
    if (typeof value === 'string') query[name] = value;
  }

  let filter;
  try {
    filter = parseFilter(query);
  } catch (error) {
    if (error instanceof HttpError) return { code: 2, output: `${error.message}\n${USAGE}` };
    throw error;
  }

  const store = new RecordStore(options.records ?? seedRecords);
  const records = store.list(filter);
  const now = options.now ?? (() => new Date());
  const file = writeExport(typeof dir === 'string' ? dir : 'exports', records, now());
  const noun = records.length === 1 ? 'record' : 'records';
  return { code: 0, output: `Wrote ${records.length} ${noun} to ${file.path}` };
}

if (process.argv[1] && realpathSync(process.argv[1]) === import.meta.filename) {
  const result = runExportRecords(process.argv.slice(2));
  if (result.code === 0) console.log(result.output);
  else console.error(result.output);
  process.exitCode = result.code;
}
