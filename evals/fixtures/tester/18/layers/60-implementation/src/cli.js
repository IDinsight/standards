#!/usr/bin/env node
import { formatBytes } from './format.js';

const args = process.argv.slice(2);
const binary = args.includes('--binary');
const values = args.filter((arg) => !arg.startsWith('--'));

if (values.length === 0) {
  process.stderr.write('usage: bytefmt [--binary] <bytes>...\n');
  process.exit(2);
}

for (const value of values) {
  process.stdout.write(`${formatBytes(Number(value), { binary })}\n`);
}
