import { readFile } from 'node:fs/promises';

import { InputError, parseEntries } from './parse.js';
import { filterByDate, formatSummary, summarize } from './summary.js';

const USAGE = 'Usage: tally <file.csv> [--by project|day] [--from YYYY-MM-DD] [--to YYYY-MM-DD]';
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseArgs(args) {
  const options = { file: null, by: 'project', from: null, to: null };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--by' || arg === '--from' || arg === '--to') {
      const value = args[i + 1];
      if (value === undefined) throw new InputError(`${arg} needs a value`);
      options[arg.slice(2)] = value;
      i += 1;
    } else if (arg.startsWith('--')) {
      throw new InputError(`unknown option: ${arg}`);
    } else if (options.file === null) {
      options.file = arg;
    } else {
      throw new InputError(`unexpected argument: ${arg}`);
    }
  }
  if (options.file === null) throw new InputError('missing input file');
  if (!['project', 'day'].includes(options.by)) throw new InputError('--by must be project or day');
  for (const name of ['from', 'to']) {
    if (options[name] !== null && !DATE.test(options[name])) {
      throw new InputError(`--${name} must be YYYY-MM-DD`);
    }
  }
  return options;
}

export async function main(args, { stdout, stderr }) {
  try {
    const options = parseArgs(args);
    const entries = parseEntries(await readFile(options.file, 'utf8'));
    const rows = summarize(filterByDate(entries, options), options.by);
    stdout.write(`${formatSummary(rows)}\n`);
    return 0;
  } catch (error) {
    if (error instanceof InputError) {
      stderr.write(`tally: ${error.message}\n${USAGE}\n`);
      return 2;
    }
    if (error.code === 'ENOENT') {
      stderr.write(`tally: cannot read ${error.path}\n`);
      return 1;
    }
    throw error;
  }
}
