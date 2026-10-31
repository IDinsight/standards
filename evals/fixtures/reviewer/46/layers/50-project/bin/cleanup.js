#!/usr/bin/env node
import { loadConfig } from '../src/config.js';
import { formatSummary, runCleanup } from '../src/cleanup.js';

try {
  const { archiveDir } = loadConfig();
  console.log(formatSummary(await runCleanup({ archiveDir })));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
