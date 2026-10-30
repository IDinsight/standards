#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

import { createClient } from './client.js';
import { CancelledError } from './retry.js';
import { syncRecords } from './sync.js';
import { httpTransport } from './transport.js';

const [file, baseUrl = process.env.RECORDS_URL] = process.argv.slice(2);
if (!file || !baseUrl) {
  console.error('Usage: records-sync <records.json> <base-url>');
  process.exit(2);
}

const controller = new AbortController();
process.once('SIGINT', () => controller.abort());

const client = createClient({
  transport: httpTransport(baseUrl),
  retry: { attempts: 5, delayMs: 1000 },
});
const records = JSON.parse(await readFile(file, 'utf8'));

try {
  const result = await syncRecords(client, records, { signal: controller.signal });
  console.log('sent ' + result.sent + ', failed batches ' + result.failed.length);
  process.exitCode = result.failed.length ? 1 : 0;
} catch (error) {
  if (error instanceof CancelledError) {
    console.error('cancelled');
    process.exitCode = 130;
  } else {
    throw error;
  }
}
