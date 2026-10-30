// RFC 4180 quoting: a field that contains the delimiter, a double quote, CR,
// or LF is enclosed in double quotes, and each double quote inside it is
// doubled. Missing values are written as empty fields.
export function csvField(value, delimiter = ',') {
  const text = value === null || value === undefined ? '' : String(value);
  const needsQuotes = text.includes(delimiter) || /["\r\n]/.test(text);
  return needsQuotes ? `"${text.replaceAll('"', '""')}"` : text;
}

// Header row of column names, then one row per record. Every row ends with CRLF.
export function toCsv(records, columns, delimiter = ',') {
  const rows = [columns, ...records.map((record) => columns.map((column) => record[column]))];
  return rows.map((row) => `${row.map((value) => csvField(value, delimiter)).join(delimiter)}\r\n`).join('');
}
