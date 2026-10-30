import type { RecordItem } from './records/store.ts';

export type Column = keyof RecordItem;

export const DEFAULT_COLUMNS: readonly Column[] = ['id', 'title', 'owner', 'status', 'createdAt'];

// RFC 4180: a field containing a comma, double quote, CR, or LF is enclosed in
// double quotes, and every double quote inside it is doubled.
export function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// Columns from a comma-separated list such as "id,title". Names are trimmed;
// a name that is not a record field, or an empty list, is rejected.
export function parseColumns(list: string): Column[] {
  const names = list.split(',').map((name) => name.trim()).filter(Boolean);
  if (names.length === 0) throw new Error('no columns given');
  for (const name of names) {
    if (!DEFAULT_COLUMNS.includes(name as Column)) throw new Error(`unknown column: ${name}`);
  }
  return names as Column[];
}

// Header row, then one row per record in the given order. Every row,
// including the last, ends with CRLF.
export function toCsv(records: readonly RecordItem[], columns: readonly Column[] = DEFAULT_COLUMNS): string {
  const rows = records.map((record) => columns.map((column) => csvCell(record[column])).join(','));
  return [columns.join(','), ...rows].map((row) => `${row}\r\n`).join('');
}
