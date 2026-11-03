import { parseCsv } from './csv.js';

export function validate(text, { delimiter = ',', required = [] } = {}) {
  const { header, rows } = parseCsv(text, delimiter);
  const problems = [];
  for (const name of required) {
    if (!header.includes(name)) problems.push({ line: 1, message: `missing column "${name}"` });
  }
  rows.forEach((cells, index) => {
    const line = index + 2;
    if (cells.length !== header.length) {
      problems.push({ line, message: `expected ${header.length} fields, found ${cells.length}` });
    }
    for (const name of required) {
      const at = header.indexOf(name);
      if (at !== -1 && !cells[at]) problems.push({ line, message: `empty value for "${name}"` });
    }
  });
  return problems;
}
