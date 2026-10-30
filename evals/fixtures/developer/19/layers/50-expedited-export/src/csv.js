// RFC 4180: quote fields that contain a comma, double quote, or line break,
// and double any embedded quotes.
function cell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(columns, rows) {
  const lines = [columns.map(cell).join(',')];
  for (const row of rows) lines.push(columns.map((column) => cell(row[column])).join(','));
  return `${lines.join('\r\n')}\r\n`;
}
