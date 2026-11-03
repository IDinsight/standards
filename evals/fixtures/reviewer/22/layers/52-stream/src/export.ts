import { once } from 'node:events';
import { createWriteStream, mkdirSync } from 'node:fs';
import path from 'node:path';
import type { Writable } from 'node:stream';

import type { RecordItem } from './records/store.ts';

const COLUMNS: readonly (keyof RecordItem)[] = ['id', 'title', 'owner', 'status', 'createdAt'];

// RFC 4180: a field containing a comma, double quote, CR, or LF is enclosed in
// double quotes, and every double quote inside it is doubled.
export function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// Header row, then one row per record in the given order, each ending with CRLF.
export function csvRows(records: readonly RecordItem[]): string[] {
  const rows = records.map((record) => COLUMNS.map((column) => csvCell(record[column])).join(','));
  return [COLUMNS.join(','), ...rows].map((row) => `${row}\r\n`);
}

export function toCsv(records: readonly RecordItem[]): string {
  return csvRows(records).join('');
}

// records-20260924T090000Z.csv for an export at 2026-09-24 09:00:00 UTC.
export function exportFileName(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `records-${stamp}.csv`;
}

export type ExportFile = {
  fileName: string;
  path: string;
  csv: string;
  timedOut: boolean;
};

export type WriteOptions = {
  timeoutMs: number;
  // Opens the stream that receives the file; defaults to fs.createWriteStream.
  open?: (file: string) => Writable;
};

// Writes each chunk, waiting for the stream to drain when its buffer is full,
// then ends the stream and waits until everything has been flushed.
async function writeAll(stream: Writable, chunks: readonly string[]): Promise<'finished'> {
  for (const chunk of chunks) {
    if (!stream.write(chunk)) await once(stream, 'drain');
  }
  stream.end();
  await once(stream, 'finish');
  return 'finished';
}

function expiry(ms: number): Promise<'timeout'> {
  return new Promise((resolve) => setTimeout(() => resolve('timeout'), ms));
}

// Streams the CSV to records-<stamp>.csv in dir. Resolves with timedOut set
// when the stream has not finished within options.timeoutMs.
export async function writeExport(
  dir: string,
  records: readonly RecordItem[],
  now: Date,
  options: WriteOptions,
): Promise<ExportFile> {
  const rows = csvRows(records);
  const csv = rows.join('');
  const fileName = exportFileName(now);
  const target = path.join(dir, fileName);
  mkdirSync(dir, { recursive: true });
  const stream = (options.open ?? createWriteStream)(target);
  const outcome = await Promise.race([writeAll(stream, rows), expiry(options.timeoutMs)]);
  return { fileName, path: target, csv, timedOut: outcome === 'timeout' };
}
