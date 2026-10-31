#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { parseArgs } from '../src/args.js';
import { parseEntries } from '../src/entries.js';
import { formatReport, summarize } from '../src/report.js';

const args = parseArgs(process.argv.slice(2));
if (args.error) {
  process.stderr.write(`report: ${args.error}\n`);
  process.exit(2);
}
const entries = parseEntries(readFileSync(args.file, 'utf8'));
process.stdout.write(`${formatReport(summarize(entries, { since: args.since }))}\n`);
