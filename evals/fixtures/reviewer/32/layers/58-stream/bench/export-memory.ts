// Measures heap growth while exporting a large record set. Run with:
//   npm run bench:export
// Writes the result to bench/results/export-memory.json and exits with status 1
// when growth exceeds the budget.
import { mkdirSync, writeFileSync } from 'node:fs';
import { Writable } from 'node:stream';

import { writeCsv } from '../src/export.ts';
import { MemorySource, type RecordItem } from '../src/records.ts';

const RECORD_COUNT = 200_000;
const BUDGET_MB = 32;
const MB = 1024 * 1024;
const OWNERS = ['dana', 'li', 'marco'];

const gc = (globalThis as { gc?: () => void }).gc;
if (!gc) {
  console.error('Run with node --expose-gc (npm run bench:export).');
  process.exit(2);
}

const records: RecordItem[] = Array.from({ length: RECORD_COUNT }, (_, index) => ({
  id: index + 1,
  title: index % 50 === 0 ? `Lease "${index}", Building B` : `Record ${index + 1}`,
  owner: OWNERS[index % OWNERS.length],
  status: index % 5 === 0 ? 'archived' : 'active',
  createdAt: new Date(Date.UTC(2026, 0, 1) + index * 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z'),
}));
const source = new MemorySource(records);

gc();
const baseline = process.memoryUsage().heapUsed;
let peak = baseline;
const sample = () => {
  peak = Math.max(peak, process.memoryUsage().heapUsed);
};
const sink = new Writable({
  write(_chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    sample();
    callback();
  },
});

const started = Date.now();
const bytes = await writeCsv(source, sink);
sample();

const growthMb = (peak - baseline) / MB;
const result = {
  records: RECORD_COUNT,
  bytes,
  baselineHeapBytes: baseline,
  peakHeapBytes: peak,
  peakGrowthMb: Number(growthMb.toFixed(2)),
  budgetMb: BUDGET_MB,
  withinBudget: growthMb <= BUDGET_MB,
  durationMs: Date.now() - started,
  node: process.version,
  measuredAt: new Date().toISOString(),
};

const resultsDir = new URL('./results/', import.meta.url);
mkdirSync(resultsDir, { recursive: true });
writeFileSync(new URL('export-memory.json', resultsDir), `${JSON.stringify(result, null, 2)}\n`);
console.log(`${RECORD_COUNT} records, ${bytes} bytes: peak heap growth ${result.peakGrowthMb} MB (budget ${BUDGET_MB} MB)`);
process.exitCode = result.withinBudget ? 0 : 1;
