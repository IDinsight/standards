#!/usr/bin/env node
// Print how many stock records a snapshot file contains.
//
//   node tools/count-records.mjs <file>
import { readFileSync } from 'node:fs';

import { parseRecords } from '../src/records.js';

const file = process.argv[2];
if (!file) {
  console.error('usage: node tools/count-records.mjs <file>');
  process.exit(2);
}

const text = readFileSync(file, 'utf8');
try {
  const records = parseRecords(text);
  console.log(`count=${records.length}`);
} catch (error) {
  console.error(`parse error: ${error.message}`);
  process.exit(1);
}
