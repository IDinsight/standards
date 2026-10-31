import { readFileSync, writeFileSync } from 'node:fs';

import { toCsv } from './csv.js';

class UsageError extends Error {}

export function parseArgs(argv) {
  const options = { input: null, output: null, fields: null, delimiter: ',' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      index += 1;
      if (argv[index] === undefined) throw new UsageError(arg + ' needs a value');
      return argv[index];
    };
    if (arg === '--input') options.input = value();
    else if (arg === '--output') options.output = value();
    else if (arg === '--fields') options.fields = value().split(',').map((name) => name.trim()).filter(Boolean);
    else if (arg === '--delimiter') options.delimiter = value();
    else throw new UsageError('unknown option ' + arg);
  }
  if (!options.input) throw new UsageError('--input is required');
  if (options.delimiter.length !== 1) throw new UsageError('--delimiter must be a single character');
  return options;
}

function fieldNames(rows) {
  const names = [];
  for (const row of rows) {
    for (const key of Object.keys(row ?? {})) {
      if (!names.includes(key)) names.push(key);
    }
  }
  return names;
}

export function run(argv, { stdout = process.stdout, stderr = process.stderr } = {}) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    stderr.write('error: ' + error.message + '\n');
    return 2;
  }

  let rows;
  try {
    rows = JSON.parse(readFileSync(options.input, 'utf8'));
  } catch {
    stderr.write('error: cannot read ' + options.input + '\n');
    return 1;
  }
  if (!Array.isArray(rows)) {
    stderr.write('error: ' + options.input + ' must contain a JSON array of records\n');
    return 1;
  }

  const known = fieldNames(rows);
  const fields = options.fields ?? known;
  if (options.fields && rows.length > 0) {
    const unknown = fields.find((name) => !known.includes(name));
    if (unknown !== undefined) {
      stderr.write('error: unknown field ' + unknown + '\n');
      return 2;
    }
  }

  const csv = toCsv(rows, fields, options.delimiter);
  if (!options.output) {
    stdout.write(csv);
    return 0;
  }
  try {
    writeFileSync(options.output, csv);
  } catch {
    stderr.write('error: cannot write ' + options.output + '\n');
    return 1;
  }
  stdout.write('Wrote ' + rows.length + ' record' + (rows.length === 1 ? '' : 's') + ' to ' + options.output + '\n');
  return 0;
}
