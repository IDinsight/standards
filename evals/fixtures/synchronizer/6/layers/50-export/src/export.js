// CSV serialization (RFC 4180) for record exports.

function cell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(rows, columns = rows.length > 0 ? Object.keys(rows[0]) : []) {
  if (columns.length === 0) return '';
  const lines = [columns.map(cell).join(',')];
  for (const row of rows) lines.push(columns.map((column) => cell(row[column])).join(','));
  return `${lines.join('\r\n')}\r\n`;
}
