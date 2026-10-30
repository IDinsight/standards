#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { parseEntries } from './entries.js';
import { weeklyTotal } from './report.js';

const USAGE = 'usage: timesheet report <file> <YYYY-MM-DD>';

export function run(args, read = (file) => readFileSync(file, 'utf8')) {
  const [command, file, date] = args;
  if (command !== 'report' || !file || !date) return { code: 2, output: USAGE };
  const total = weeklyTotal(parseEntries(read(file)), date);
  return { code: 0, output: `Week of ${total.week}: ${total.hours} h` };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { code, output } = run(process.argv.slice(2));
  console.log(output);
  process.exitCode = code;
}
