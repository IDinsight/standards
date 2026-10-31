#!/usr/bin/env node
import { loadCleanupConfig } from '../src/config.js';
import { formatSummary, runCleanup } from '../src/cleanup.js';

const args = process.argv.slice(2);
const unknown = args.filter((arg) => arg !== '--dry-run');
if (unknown.length > 0) {
  console.error(`unknown option: ${unknown[0]}\nusage: node bin/cleanup.js [--dry-run]`);
  process.exit(2);
}

try {
  const config = loadCleanupConfig();
  const summary = await runCleanup({ ...config, dryRun: args.includes('--dry-run') });
  console.log(formatSummary(summary));
  if (summary.dryRun) {
    for (const name of summary.removed) console.log(`  ${name}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
