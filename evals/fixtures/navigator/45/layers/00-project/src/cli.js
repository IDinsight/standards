#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

import { parseLog } from './parse.js';
import { formatSummary, totalsByProject } from './summary.js';

const [file] = process.argv.slice(2);
if (!file) {
  console.error('Usage: worklog <file>');
  process.exitCode = 2;
} else {
  const text = await readFile(file, 'utf8');
  console.log(formatSummary(totalsByProject(parseLog(text))));
}
