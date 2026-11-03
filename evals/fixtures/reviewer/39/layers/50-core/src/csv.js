export const COLUMNS = ['id', 'title', 'owner'];

// RFC 4180: a field containing a comma, double quote, CR, or LF is enclosed in
// double quotes, and every double quote inside it is doubled.
export function formatCell(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// One CSV row, terminated with CRLF.
export function formatRow(values) {
  return `${values.map(formatCell).join(',')}\r\n`;
}

// Parses CSV text whose first row is a header into objects keyed by the header
// names. Accepts CRLF or LF line endings and skips blank lines.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header = [], ...data] = rows;
  return data
    .filter((cells) => !(cells.length === 1 && cells[0] === ''))
    .map((cells) => Object.fromEntries(header.map((name, column) => [name, cells[column] ?? ''])));
}
