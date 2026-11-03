export type Row = Record<string, string>;

// Committed first step: header plus plain joins.
export function toCsv(rows: Row[]): string {
  if (rows.length === 0) return '';
  const header = Object.keys(rows[0]);
  const lines = rows.map((row) => header.map((key) => row[key] ?? '').join(','));
  return [header.join(','), ...lines].join('\n');
}
