// CSV reading and writing (RFC 4180) shared by record import and export.

// Reads CSV text into rows of fields. A field may be enclosed in double
// quotes; inside quotes, "" is a literal double quote and commas and line
// breaks belong to the field. Rows end with CRLF or LF.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// Encloses a value in double quotes when it contains a comma, double quote,
// CR, or LF, doubling each double quote inside it.
export function csvField(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// Joins rows of values into CSV text. Every row, including the last, ends
// with CRLF.
export function formatCsv(rows) {
  return rows.map((row) => `${row.map(csvField).join(',')}\r\n`).join('');
}
