import type { RecordItem } from './records.ts';

export const COLUMNS: readonly (keyof RecordItem)[] = ['id', 'title', 'owner', 'status', 'createdAt'];

export type Delimiter = ',' | ';';

export type CsvOptions = {
  // Field separator; comma unless the caller asks for semicolons.
  delimiter?: Delimiter;
};

// Characters that force a field to be quoted, for each delimiter.
const NEEDS_QUOTES: Record<Delimiter, RegExp> = {
  ',': /[",\r\n]/,
  ';': /[";\r\n]/,
};

// RFC 4180: a field containing the delimiter, a double quote, CR, or LF is
// enclosed in double quotes, and every double quote inside it is doubled.
export function csvCell(value: string | number, delimiter: Delimiter = ','): string {
  const text = String(value);
  return NEEDS_QUOTES[delimiter].test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// Header row, then one row per record in the given order. Every row ends with CRLF.
export function toCsv(records: readonly RecordItem[], options: CsvOptions = {}): string {
  const delimiter = options.delimiter ?? ',';
  const rows = records.map((record) => COLUMNS.map((column) => csvCell(record[column], delimiter)).join(delimiter));
  return [COLUMNS.join(delimiter), ...rows].map((row) => `${row}\r\n`).join('');
}

// records-20260924T090000Z.csv for an export at 2026-09-24 09:00:00 UTC.
export function exportFileName(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `records-${stamp}.csv`;
}
