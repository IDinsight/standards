// CSV reading and writing (RFC 4180) shared by record import and export.

// Reads CSV text into rows of fields, one row per line. A field may be
// enclosed in double quotes; inside quotes, "" is a literal double quote and
// commas belong to the field. Rows end with CRLF or LF; blank lines are
// skipped.
export function parseCsv(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')
    .map(parseLine);
}

function parseLine(line) {
  const fields = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
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
      fields.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  fields.push(field);
  return fields;
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
