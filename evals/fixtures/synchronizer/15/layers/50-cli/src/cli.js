import { readFileSync, writeFileSync } from 'node:fs';

import { toCsv } from './csv.js';

export const VERSION = '1.2.0';

export const USAGE = `Usage: records-export <input.json> [options]

Options:
  -c, --columns <list>    comma-separated columns to export, in order
                          (default: the keys of the first record)
  -o, --output <file>     write the CSV to <file> instead of standard output
      --delimiter <char>  field delimiter, one character (default: ,)
  -h, --help              show this help
  -v, --version           show the version
`;

export class UsageError extends Error {}

function optionValue(argv, index) {
  if (index + 1 >= argv.length) throw new UsageError(`${argv[index]} needs a value`);
  return argv[index + 1];
}

export function parseArgs(argv) {
  const options = { input: null, columns: null, output: null, delimiter: ',', help: false, version: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '-h':
      case '--help':
        options.help = true;
        break;
      case '-v':
      case '--version':
        options.version = true;
        break;
      case '-c':
      case '--columns':
        options.columns = optionValue(argv, i).split(',').map((name) => name.trim()).filter(Boolean);
        i += 1;
        break;
      case '-o':
      case '--output':
        options.output = optionValue(argv, i);
        i += 1;
        break;
      case '--delimiter':
        options.delimiter = optionValue(argv, i);
        i += 1;
        break;
      default:
        if (arg.startsWith('-')) throw new UsageError(`unknown option: ${arg}`);
        if (options.input !== null) throw new UsageError(`unexpected argument: ${arg}`);
        options.input = arg;
    }
  }
  if (options.delimiter.length !== 1) throw new UsageError('--delimiter must be a single character');
  return options;
}

// Runs the command with the given arguments and output streams and returns
// the exit status.
export function run(argv, io) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    io.stderr.write(`records-export: ${error.message}\n${USAGE}`);
    return 2;
  }
  if (options.help) {
    io.stdout.write(USAGE);
    return 0;
  }
  if (options.version) {
    io.stdout.write(`${VERSION}\n`);
    return 0;
  }
  if (options.input === null) {
    io.stderr.write(`records-export: missing input file\n${USAGE}`);
    return 2;
  }
  let records;
  try {
    records = JSON.parse(readFileSync(options.input, 'utf8'));
  } catch (error) {
    io.stderr.write(`records-export: cannot read ${options.input}: ${error.message}\n`);
    return 1;
  }
  if (!Array.isArray(records)) {
    io.stderr.write(`records-export: ${options.input} must contain a JSON array\n`);
    return 1;
  }
  const columns = options.columns ?? Object.keys(records[0] ?? {});
  const csv = toCsv(records, columns, options.delimiter);
  if (options.output) {
    writeFileSync(options.output, csv, 'utf8');
    io.stderr.write(`records-export: wrote ${records.length} records to ${options.output}\n`);
  } else {
    io.stdout.write(csv);
  }
  return 0;
}
