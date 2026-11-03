function cell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(rows) {
  if (rows.length === 0) return '';
  const header = Object.keys(rows[0]);
  const lines = [
    header.map(cell).join(','),
    ...rows.map((row) => header.map((key) => cell(row[key])).join(',')),
  ];
  return `${lines.join('\n')}\n`;
}

export function archiveName(date) {
  return `export-${date.toISOString().slice(0, 10)}.csv`;
}
