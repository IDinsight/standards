import { closeSync, mkdirSync, openSync, renameSync, writeSync } from 'node:fs';
import path from 'node:path';

import type { RecordItem } from './records/store.ts';

const COLUMNS: readonly (keyof RecordItem)[] = ['id', 'title', 'owner', 'status', 'createdAt'];
const HEADER = `${COLUMNS.join(',')}\r\n`;

// RFC 4180: a field containing a comma, double quote, CR, or LF is enclosed in
// double quotes, and every double quote inside it is doubled.
export function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// One CRLF-terminated CSV row for a record.
export function csvRow(record: RecordItem): string {
  return `${COLUMNS.map((column) => csvCell(record[column])).join(',')}\r\n`;
}

// Header row, then one row per record in the given order. Every row ends with CRLF.
export function toCsv(records: readonly RecordItem[]): string {
  return HEADER + records.map(csvRow).join('');
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
};

// Rows are written to `<file name>.tmp` next to the target, and the file is
// renamed to its final name only after the last row is written, so the export
// folder never shows a half-written export under its real name.
export function writeExport(dir: string, records: readonly RecordItem[], now: Date): ExportFile {
  const fileName = exportFileName(now);
  const target = path.join(dir, fileName);
  const temporary = `${target}.tmp`;
  mkdirSync(dir, { recursive: true });
  const fd = openSync(temporary, 'w');
  const chunks = [HEADER];
  writeSync(fd, HEADER);
  for (const record of records) {
    const row = csvRow(record);
    writeSync(fd, row);
    chunks.push(row);
  }
  closeSync(fd);
  renameSync(temporary, target);
  return { fileName, path: target, csv: chunks.join('') };
}
