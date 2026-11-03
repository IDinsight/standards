function cell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(report) {
  const lines = [report.columns.map(cell).join(',')];
  for (const row of report.rows) {
    lines.push(report.columns.map((column) => cell(row[column])).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}
