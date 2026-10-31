#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

import { convert } from '../src/convert.js';
import { validate } from '../src/validate.js';

const USAGE = `Usage:
  rowtool convert <file.csv> [--delimiter <char>] [--out <file.json>]
  rowtool validate <file.csv> [--delimiter <char>] [--require <col,col,...>]`;

function parseArgs(argv) {
  const [command, file, ...rest] = argv;
  const options = {};
  for (let index = 0; index < rest.length; index += 2) {
    const name = rest[index];
    const value = rest[index + 1];
    if (value === undefined) throw new Error(`missing value for ${name}`);
    if (name === '--delimiter') options.delimiter = value;
    else if (name === '--out') options.out = value;
    else if (name === '--require') options.required = value.split(',').map((column) => column.trim()).filter(Boolean);
    else throw new Error(`unknown option ${name}`);
  }
  return { command, file, options };
}

function main(argv) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (error) {
    console.error(error.message);
    console.error(USAGE);
    return 2;
  }
  const { command, file, options } = args;
  if (!file || !['convert', 'validate'].includes(command)) {
    console.error(USAGE);
    return 2;
  }
  const text = readFileSync(file, 'utf8');
  if (command === 'convert') {
    const json = `${JSON.stringify(convert(text, options), null, 2)}\n`;
    if (options.out) writeFileSync(options.out, json);
    else process.stdout.write(json);
    return 0;
  }
  const problems = validate(text, options);
  for (const problem of problems) console.log(`${file}:${problem.line}: ${problem.message}`);
  if (problems.length === 0) console.log(`${file}: ok`);
  return problems.length === 0 ? 0 : 1;
}

process.exitCode = main(process.argv.slice(2));
