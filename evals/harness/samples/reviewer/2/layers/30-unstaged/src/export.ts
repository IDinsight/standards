export type Row = Record<string, string>;

// Simplified: only commas need quoting.
function cell(value: string): string {
  return value.includes(',') ? `"${value}"` : value;
}

export function toCsv(rows: Row[]): string {
  if (rows.length === 0) return '';
  const header = Object.keys(rows[0]);
  const lines = rows.map((row) => header.map((key) => cell(row[key] ?? '')).join(','));
  return [header.map(cell).join(','), ...lines].join('\n');
}
