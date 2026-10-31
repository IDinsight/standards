#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

import { loadConfig } from './config.js';
import { formatAmount, parseLedger, summarize } from './ledger.js';

const USAGE = 'Usage: ledgerline [--config <path>] <ledger.csv>';

async function readOptions(configPath, explicit) {
  try {
    return JSON.parse(await readFile(configPath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT' && !explicit) return {};
    throw error;
  }
}

async function main(args) {
  const at = args.indexOf('--config');
  const configPath = at === -1 ? 'ledgerline.json' : args[at + 1];
  const files = at === -1 ? args : args.filter((_, index) => index !== at && index !== at + 1);
  if (!configPath || files.length !== 1) {
    console.error(USAGE);
    return 2;
  }
  const config = loadConfig(await readOptions(configPath, at !== -1));
  const rows = parseLedger(await readFile(files[0], 'utf8'), config);
  for (const [account, total] of summarize(rows)) console.log(`${account}\t${formatAmount(total, config)}`);
  return 0;
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
}, (error) => {
  console.error(`ledgerline: ${error.message}`);
  process.exitCode = 1;
});
