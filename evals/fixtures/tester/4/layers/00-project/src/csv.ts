// CSV writing for the bulk-import rejection report.

// A field is enclosed in double quotes when it contains a comma or a double
// quote; double quotes inside it are doubled.
const NEEDS_QUOTES = /[",]/;

export function escapeCell(value: string | number): string {
  const text = String(value);
  return NEEDS_QUOTES.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function formatRow(cells: readonly (string | number)[]): string {
  return cells.map(escapeCell).join(',');
}
