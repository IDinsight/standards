#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { exportEntries } from '../src/export.js';

const args = process.argv.slice(2);
const options = {};
const files = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--level') options.minLevel = args[++i];
  else files.push(args[i]);
}
if (files.length !== 1) {
  console.error('usage: logpack [--level LEVEL] <file>');
  process.exit(2);
}
process.stdout.write(`${exportEntries(readFileSync(files[0], 'utf8'), options)}\n`);
