function cell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(rows) {
  if (rows.length === 0) return '';
  const columns = Object.keys(rows[0]);
  const lines = rows.map((row) => columns.map((key) => cell(row[key])).join(','));
  return [columns.map(cell).join(','), ...lines].join('\n');
}
