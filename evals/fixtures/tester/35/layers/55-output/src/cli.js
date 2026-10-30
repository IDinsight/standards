#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { formatJson, formatText } from './format.js';
import { parseOrders } from './parse.js';
import { summarize } from './summary.js';

const USAGE = 'usage: order-summary [--format text|json] <orders.csv>';
const FORMATS = { text: formatText, json: formatJson };

function readArgs() {
  try {
    const { values, positionals } = parseArgs({
      allowPositionals: true,
      options: { format: { type: 'string', default: 'text' } },
    });
    if (positionals.length !== 1 || !Object.hasOwn(FORMATS, values.format)) return null;
    return { file: positionals[0], render: FORMATS[values.format] };
  } catch {
    return null;
  }
}

const args = readArgs();
if (!args) {
  console.error(USAGE);
  process.exit(2);
}
process.stdout.write(args.render(summarize(parseOrders(readFileSync(args.file, 'utf8')))));
