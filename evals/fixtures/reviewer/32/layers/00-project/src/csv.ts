import type { RecordItem } from './records.ts';

export const COLUMNS = ['id', 'title', 'owner', 'status', 'createdAt'] as const;

export const CSV_HEADER = `${COLUMNS.join(',')}\r\n`;

// RFC 4180: a field containing a comma, double quote, CR, or LF is enclosed in
// double quotes, and every double quote inside it is doubled.
export function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function csvRow(record: RecordItem): string {
  return `${COLUMNS.map((column) => csvCell(record[column])).join(',')}\r\n`;
}
