#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { filterLines } from './filter.js';

export function parseArgs(argv) {
  const options = { level: 'warn', grep: null, file: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--level') options.level = argv[++index];
    else if (arg === '--grep') options.grep = argv[++index];
    else if (arg.startsWith('--')) throw new Error(`unknown option: ${arg}`);
    else options.file = arg;
  }
  if (options.level === undefined || options.grep === undefined) throw new Error('missing option value');
  return options;
}

export function run(argv, readInput) {
  const options = parseArgs(argv);
  const text = options.file ? readFileSync(options.file, 'utf8') : readInput();
  return filterLines(text.split('\n'), options).map((line) => `${line}\n`).join('');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.stdout.write(run(process.argv.slice(2), () => readFileSync(0, 'utf8')));
  } catch (error) {
    process.stderr.write(`logtrim: ${error.message}\n`);
    process.exitCode = 2;
  }
}
