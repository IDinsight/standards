#!/usr/bin/env node
import { run } from '../src/main.js';

const { code, output } = run(process.argv.slice(2));
process.stdout.write(`${output}\n`);
process.exitCode = code;
