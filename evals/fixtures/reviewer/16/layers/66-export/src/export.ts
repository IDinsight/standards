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

export function toCsv(records: readonly RecordItem[]): string {
  const rows = records.map((record) => COLUMNS.map((column) => csvCell(record[column])).join(','));
  return [COLUMNS.join(','), ...rows].map((row) => `${row}\r\n`).join('');
}

export function exportFileName(now: Date, copy: number = 1): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return copy > 1 ? `records-${stamp}-${copy}.csv` : `records-${stamp}.csv`;
}

// Writes the CSV under a new name in `dir`; an existing file is never replaced.
export function writeExport(dir: string, records: readonly RecordItem[], now: Date) {
  const csv = toCsv(records);
  mkdirSync(dir, { recursive: true });
  for (let copy = 1; ; copy += 1) {
    const fileName = exportFileName(now, copy);
    try {
      writeFileSync(path.join(dir, fileName), csv, { encoding: 'utf8', flag: 'wx' });
      return { fileName, csv };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
  }
}
