// CSV writing shared by the bulk-import rejection report and the records
// export.

// A field is enclosed in double quotes when it contains a comma, a double
// quote, or a line break (RFC 4180); double quotes inside it are doubled.
const NEEDS_QUOTES = /[",\r\n]/;

export function escapeCell(value: string | number): string {
  const text = String(value);
  return NEEDS_QUOTES.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function formatRow(cells: readonly (string | number)[]): string {
  return cells.map(escapeCell).join(',');
}
