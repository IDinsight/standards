import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { RecordItem } from './records/store.ts';

const COLUMNS: readonly (keyof RecordItem)[] = ['id', 'title', 'owner', 'status', 'createdAt'];
const TOKEN = /^[0-9a-f]{32}$/;

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

// 128 random bits, hex encoded. An export is stored and downloaded by its token.
export function newExportToken(): string {
  return randomBytes(16).toString('hex');
}

export function isExportToken(value: string): boolean {
  return TOKEN.test(value);
}

// Writes the CSV for records to <dir>/<token>.csv, creating dir when missing.
export function writeExport(dir: string, records: readonly RecordItem[], token: string): string {
  if (!isExportToken(token)) throw new Error(`invalid export token: ${token}`);
  const csv = toCsv(records);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `${token}.csv`), csv, 'utf8');
  return csv;
}

// The CSV of a stored export, or null when the token is malformed or unknown.
export function readExport(dir: string, token: string): string | null {
  if (!isExportToken(token)) return null;
  const file = path.join(dir, `${token}.csv`);
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}
