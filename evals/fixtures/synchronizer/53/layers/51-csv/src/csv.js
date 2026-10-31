// RFC 4180 CSV output: CRLF line endings, fields quoted when they contain a
// comma, a double quote, or a line break.
function cell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(rows, columns) {
  const lines = [columns.map(cell).join(',')];
  for (const row of rows) {
    lines.push(columns.map((column) => cell(row[column])).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}
