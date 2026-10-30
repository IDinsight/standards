const COLUMNS = ['timestamp', 'actor', 'action', 'target'];

// RFC 4180: quote fields containing a comma, double quote, CR, or LF, and double embedded quotes.
function cell(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(entries) {
  const lines = [COLUMNS.join(',')];
  for (const entry of entries) {
    lines.push(COLUMNS.map((key) => cell(entry[key])).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}
