import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { RecordItem } from './records/store.ts';

const COLUMNS: readonly (keyof RecordItem)[] = ['id', 'title', 'owner', 'status', 'createdAt'];

// RFC 4180: a field containing a comma, double quote, CR, or LF is enclosed in
// double quotes, and every double quote inside it is doubled.
export function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// Header row, then one row per record in the given order. Every row ends with CRLF.
export function toCsv(records: readonly RecordItem[]): string {
  const rows = records.map((record) => COLUMNS.map((column) => csvCell(record[column])).join(','));
  return [COLUMNS.join(','), ...rows].map((row) => `${row}\r\n`).join('');
}

// <prefix>-20260924T090000Z.csv for an export at 2026-09-24 09:00:00 UTC. The
// service uses the default prefix, records.
export function exportFileName(now: Date, prefix = 'records'): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `${prefix}-${stamp}.csv`;
}

export type ExportFile = {
  fileName: string;
  path: string;
  csv: string;
};

export function writeExport(dir: string, records: readonly RecordItem[], now: Date, prefix = 'records'): ExportFile {
  const csv = toCsv(records);
  const fileName = exportFileName(now, prefix);
  const target = path.join(dir, fileName);
  mkdirSync(dir, { recursive: true });
  writeFileSync(target, csv, 'utf8');
  return { fileName, path: target, csv };
}
