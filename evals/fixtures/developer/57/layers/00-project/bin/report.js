#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { parseRecords } from '../src/records.js';
import { monthlyReport } from '../src/report.js';

const [file, month] = process.argv.slice(2);
if (!file || !/^\d{4}-\d{2}$/.test(month ?? '')) {
  console.error('Usage: report <file.csv> <YYYY-MM>');
  process.exit(2);
}
console.log(monthlyReport(parseRecords(readFileSync(file, 'utf8')), month));
