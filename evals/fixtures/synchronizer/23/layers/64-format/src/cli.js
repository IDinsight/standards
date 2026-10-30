import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { toCsv } from './csv.js';
import { STATUSES, filterRecords, records as bundled } from './records.js';

export const FORMATS = ['csv', 'json'];

export const USAGE = `Usage: export-records [--status <active|archived>] [--owner <name>] [--format <csv|json>] [--out <file>]

Writes the matching records in the chosen format (CSV by default) to standard
output or to the file given with --out.`;

const SERIALIZERS = {
  csv: toCsv,
  json: (list) => `${JSON.stringify(list, null, 2)}\n`,
};

// Runs the command with the given arguments and returns the exit code.
export function run(argv, io = {}) {
  const { stdout = process.stdout, stderr = process.stderr, records = bundled } = io;
  let values;
  try {
    ({ values } = parseArgs({
      args: argv,
      options: {
        status: { type: 'string' },
        owner: { type: 'string' },
        format: { type: 'string', default: 'csv' },
        out: { type: 'string' },
        help: { type: 'boolean', default: false },
      },
    }));
  } catch (error) {
    stderr.write(`${error.message}\n${USAGE}\n`);
    return 2;
  }
  if (values.help) {
    stdout.write(`${USAGE}\n`);
    return 0;
  }
  if (values.status && !STATUSES.includes(values.status)) {
    stderr.write(`unknown status: ${values.status}\n`);
    return 2;
  }
  if (!FORMATS.includes(values.format)) {
    stderr.write(`unknown format: ${values.format}\n${USAGE}\n`);
    return 2;
  }
  const selected = filterRecords(records, values);
  const text = SERIALIZERS[values.format](selected);
  if (values.out) writeFileSync(values.out, text, 'utf8');
  else stdout.write(text);
  return 0;
}
