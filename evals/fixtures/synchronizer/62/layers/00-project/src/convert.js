import { parseCsv } from './csv.js';

export function convert(text, { delimiter = ',' } = {}) {
  const { header, rows } = parseCsv(text, delimiter);
  return rows.map((cells) => Object.fromEntries(header.map((name, index) => [name, cells[index] ?? ''])));
}
