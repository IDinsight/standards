#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { USAGE, parseArgs } from '../src/args.js';
import { parseLog } from '../src/parse.js';
import { formatSummary, summarize } from '../src/summarize.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

function main(argv) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    process.stderr.write(`logsum: ${error.message}\n${USAGE}\n`);
    return 2;
  }
  if (options.help) {
    process.stdout.write(`${USAGE}\n`);
    return 0;
  }
  if (options.version) {
    process.stdout.write(`${pkg.version}\n`);
    return 0;
  }
  if (!options.files.length) {
    process.stderr.write(`logsum: no input files\n${USAGE}\n`);
    return 2;
  }
  const entries = [];
  for (const file of options.files) {
    let text;
    try {
      text = readFileSync(file, 'utf8');
    } catch (error) {
      process.stderr.write(`logsum: cannot read ${file}: ${error.code}\n`);
      return 1;
    }
    entries.push(...parseLog(text));
  }
  process.stdout.write(`${formatSummary(summarize(entries, options))}\n`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
