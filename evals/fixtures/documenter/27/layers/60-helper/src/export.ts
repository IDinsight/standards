import type { RecordItem } from './records/store.ts';

const COLUMNS: readonly (keyof RecordItem)[] = ['id', 'title', 'owner', 'status', 'createdAt'];

// Quote a field that contains a comma or a double quote, doubling the quotes.
export function csvCell(value: string | number): string {
  const text = String(value);
  return /[",]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// Header row, then one row per record in the given order.
export function toCsv(records: readonly RecordItem[]): string {
  const rows = records.map((record) => COLUMNS.map((column) => csvCell(record[column])).join(','));
  return [COLUMNS.join(','), ...rows].join('\n');
}
