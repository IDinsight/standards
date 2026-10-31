#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

import { parseArgs } from '../src/args.js';
import { count } from '../src/count.js';

const USAGE = 'Usage: tally [-l|-w|-c] [--json] [file ...]';

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main(argv) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    process.stderr.write(`tally: ${error.message}\n${USAGE}\n`);
    return 2;
  }
  if (options.help) {
    process.stdout.write(`${USAGE}\n`);
    return 0;
  }
  const inputs = options.files.length ? options.files : ['-'];
  const results = [];
  for (const file of inputs) {
    try {
      const text = file === '-' ? await readStdin() : await readFile(file, 'utf8');
      results.push({ file, count: count(text, { mode: options.mode }) });
    } catch (error) {
      process.stderr.write(`tally: ${file}: ${error.code ?? error.message}\n`);
      return 1;
    }
  }
  const total = results.reduce((sum, result) => sum + result.count, 0);
  if (options.json) {
    process.stdout.write(`${JSON.stringify({ mode: options.mode, files: results, total })}\n`);
  } else {
    for (const result of results) process.stdout.write(`${result.count}\t${result.file}\n`);
    if (results.length > 1) process.stdout.write(`${total}\ttotal\n`);
  }
  return 0;
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
});
