#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { ParseError, parse } from './parser.js';

const [file] = process.argv.slice(2);
if (!file) {
  console.error('usage: ini2json <file.ini>');
  process.exit(2);
}

try {
  process.stdout.write(`${JSON.stringify(parse(readFileSync(file, 'utf8')), null, 2)}\n`);
} catch (error) {
  if (!(error instanceof ParseError)) throw error;
  console.error(`${file}: ${error.message}`);
  process.exit(1);
}
