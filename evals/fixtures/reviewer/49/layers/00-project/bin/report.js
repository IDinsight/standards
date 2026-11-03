#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { parseEntries } from '../src/entries.js';
import { formatReport, summarize } from '../src/report.js';

const file = process.argv[2];
if (!file) {
  process.stderr.write('usage: report <file>\n');
  process.exit(2);
}
process.stdout.write(`${formatReport(summarize(parseEntries(readFileSync(file, 'utf8'))))}\n`);
