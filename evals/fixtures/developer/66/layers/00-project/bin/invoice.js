#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { run } from '../src/cli.js';

const result = run(process.argv.slice(2), {
  readFile: (path) => readFileSync(path, 'utf8'),
});
process.stdout.write(result.stdout);
process.stderr.write(result.stderr);
process.exitCode = result.code;
