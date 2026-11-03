#!/usr/bin/env node
import { USAGE, runImport } from '../src/import.js';

const [command, ...rest] = process.argv.slice(2);
if (command === 'import') {
  process.exitCode = await runImport(rest, { stdout: process.stdout, stderr: process.stderr });
} else {
  process.stderr.write(USAGE);
  process.exitCode = 2;
}
