// RFC 4180: CRLF line endings; quote a field that holds a comma, double quote, or line break.
const COLUMNS = ['sku', 'name', 'quantity'];

function cell(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(items) {
  const lines = [COLUMNS.join(','), ...items.map((item) => COLUMNS.map((key) => cell(item[key])).join(','))];
  return `${lines.join('\r\n')}\r\n`;
}
