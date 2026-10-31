#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

import { loadConfig } from '../src/config.js';
import { headings, insertToc, renderToc } from '../src/toc.js';

const USAGE = 'usage: mdtoc <file.md> [--write] [--max-depth N]';

function parseArgs(argv) {
  const options = { file: null, write: false, maxDepth: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--write') options.write = true;
    else if (arg === '--max-depth') options.maxDepth = Number(argv[(i += 1)]);
    else if (!options.file) options.file = arg;
    else throw new Error(`unexpected argument: ${arg}`);
  }
  if (!options.file) throw new Error(USAGE);
  return options;
}

function main(argv) {
  const options = parseArgs(argv);
  const config = loadConfig(process.cwd());
  const maxDepth = options.maxDepth ?? config.maxDepth;
  const markdown = readFileSync(options.file, 'utf8');
  const toc = renderToc(headings(markdown, maxDepth), { bullet: config.bullet });
  if (options.write) {
    writeFileSync(options.file, insertToc(markdown, toc));
    return 0;
  }
  process.stdout.write(`${toc}\n`);
  return 0;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`mdtoc: ${error.message}\n`);
  process.exitCode = 2;
}
