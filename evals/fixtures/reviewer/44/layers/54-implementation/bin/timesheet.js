#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { LogError, renderReport, summarize } from '../src/report.js';

function main(args) {
  const [file] = args;
  if (!file) {
    process.stderr.write('usage: timesheet <log-file>\n');
    return 2;
  }
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch (error) {
    process.stderr.write(`timesheet: cannot read ${file}: ${error.code ?? error.message}\n`);
    return 2;
  }
  let rows;
  try {
    rows = summarize(text);
  } catch (error) {
    if (!(error instanceof LogError)) throw error;
    process.stderr.write(`timesheet: ${error.message}\n`);
    return 1;
  }
  if (rows.length > 0) process.stdout.write(`${renderReport(rows)}\n`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
