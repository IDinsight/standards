#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { parseRecords } from '../src/records.js';
import { renderJson, renderText } from '../src/render.js';
import { summarizeMonth } from '../src/summary.js';

const USAGE = 'Usage: report <file.csv> <YYYY-MM> [--format text|json]';
const renderers = { text: renderText, json: renderJson };

function parseArgs(args) {
  const positional = [];
  let format = 'text';
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--format') {
      format = args[index + 1];
      index += 1;
    } else {
      positional.push(args[index]);
    }
  }
  return { file: positional[0], month: positional[1], format };
}

const { file, month, format } = parseArgs(process.argv.slice(2));
if (!file || !/^\d{4}-\d{2}$/.test(month ?? '') || !Object.hasOwn(renderers, format ?? '')) {
  console.error(USAGE);
  process.exit(2);
}
const summary = summarizeMonth(parseRecords(readFileSync(file, 'utf8')), month);
console.log(renderers[format](summary));
