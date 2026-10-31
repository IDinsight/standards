// RFC 4180 quoting: wrap cells that contain a comma, double quote, or line
// break, and double any embedded quotes.
export function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function csvLine(values) {
  return values.map(csvCell).join(',');
}
