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

// 20260924T090000Z for 2026-09-24 09:00:00 UTC.
export function exportStamp(now: Date): string {
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

// records-20260924T090000Z.csv for the first export in that second,
// records-20260924T090000Z-2.csv for the second one, and so on.
export function exportFileName(now: Date, sequence = 1): string {
  const suffix = sequence > 1 ? `-${sequence}` : '';
  return `records-${exportStamp(now)}${suffix}.csv`;
}

export type ExportFile = {
  fileName: string;
  path: string;
  csv: string;
};

// Writes the CSV under the first free file name for this second. Files are
// created exclusively, so an existing export file is never replaced.
export function writeExport(dir: string, records: readonly RecordItem[], now: Date): ExportFile {
  const csv = toCsv(records);
  mkdirSync(dir, { recursive: true });
  for (let sequence = 1; ; sequence += 1) {
    const fileName = exportFileName(now, sequence);
    const target = path.join(dir, fileName);
    try {
      writeFileSync(target, csv, { encoding: 'utf8', flag: 'wx' });
      return { fileName, path: target, csv };
    } catch (error) {
      if ((error as { code?: string }).code !== 'EEXIST') throw error;
    }
  }
}
