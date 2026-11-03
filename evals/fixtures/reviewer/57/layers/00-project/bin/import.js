#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

import { readConfig } from '../src/config.js';
import { parseLines, summarize } from '../src/parse.js';

try {
  const config = readConfig(process.argv.slice(2), process.env);
  const text = await readFile(config.input, 'utf8');
  const rows = parseLines(text, config);
  process.stdout.write(`${JSON.stringify(summarize(rows, config.currency))}\n`);
} catch (error) {
  process.stderr.write(`ledger-import: ${error.message}\n`);
  process.exitCode = 1;
}
