// Convert records to CSV text.

export function quote(value, delimiter) {
  const text = value === null || value === undefined ? '' : String(value);
  if (text.includes(delimiter) || /["\r\n]/.test(text)) {
    return '"' + text.replaceAll('"', '""') + '"';
  }
  return text;
}

export function toCsv(rows, fields, delimiter = ',') {
  if (fields.length === 0) return '';
  const lines = [fields.map((field) => quote(field, delimiter)).join(delimiter)];
  for (const row of rows) {
    lines.push(fields.map((field) => quote(row?.[field], delimiter)).join(delimiter));
  }
  return lines.join('\n') + '\n';
}
