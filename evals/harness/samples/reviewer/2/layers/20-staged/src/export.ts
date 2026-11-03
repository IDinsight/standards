export type Row = Record<string, string>;

// RFC 4180 quoting: wrap fields containing comma, quote, or newline, and double quotes.
function cell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function toCsv(rows: Row[]): string {
  if (rows.length === 0) return '';
  const header = Object.keys(rows[0]);
  const lines = rows.map((row) => header.map((key) => cell(row[key] ?? '')).join(','));
  return [header.map(cell).join(','), ...lines].join('\n');
}
