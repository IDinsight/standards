import { Batcher } from './batcher.js';
import { loadConfig } from './config.js';
import { readNdjson } from './reader.js';
import { createHttpSink } from './sink.js';

const input = process.argv[2];
if (!input) {
  console.error('usage: node src/main.js <events.ndjson>');
  process.exit(2);
}

const config = loadConfig();
const batcher = new Batcher({ ...config, send: createHttpSink(config.sinkUrl) });
for await (const record of readNdjson(input)) await batcher.add(record);
await batcher.drain();

const { records, batches, retries } = batcher.stats;
console.log(`sent ${records} records in ${batches} batches (${retries} retries, ${batcher.failed.length} failed batches)`);
if (batcher.failed.length) process.exitCode = 1;
