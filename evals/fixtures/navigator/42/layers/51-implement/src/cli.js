#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { parseEntries } from './entries.js';
import { projectTotals, weeklyTotal } from './report.js';

const USAGE = 'usage: timesheet report <file> <YYYY-MM-DD> [--by-project]';

export function run(args, read = (file) => readFileSync(file, 'utf8')) {
  const [command, file, date, ...flags] = args;
  if (command !== 'report' || !file || !date || flags.some((flag) => flag !== '--by-project')) {
    return { code: 2, output: USAGE };
  }
  const entries = parseEntries(read(file));
  const total = weeklyTotal(entries, date);
  const lines = [`Week of ${total.week}: ${total.hours} h`];
  if (flags.includes('--by-project')) {
    for (const { project, hours } of projectTotals(entries, date)) lines.push(`  ${project}: ${hours} h`);
  }
  return { code: 0, output: lines.join('\n') };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { code, output } = run(process.argv.slice(2));
  console.log(output);
  process.exitCode = code;
}
