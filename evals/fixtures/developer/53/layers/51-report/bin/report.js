#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { parseExpenses, totalsByCategory } from '../src/expenses.js';
import { formatReport } from '../src/report.js';

const [file] = process.argv.slice(2);
if (!file) {
  console.error('usage: report <expenses.csv>');
  process.exit(2);
}

const expenses = parseExpenses(readFileSync(file, 'utf8'));
console.log(formatReport(totalsByCategory(expenses)));
