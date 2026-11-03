export const COLUMNS = ['id', 'title', 'owner', 'status', 'createdAt'];

// RFC 4180: a field containing a comma, double quote, CR, or LF is enclosed in
// double quotes and every double quote inside it is doubled.
export function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// One CSV line, terminated with CRLF.
export function csvLine(values) {
  return `${values.map(csvCell).join(',')}\r\n`;
}

export function recordLine(record) {
  return csvLine(COLUMNS.map((column) => record[column]));
}

export const HEADER = csvLine(COLUMNS);
