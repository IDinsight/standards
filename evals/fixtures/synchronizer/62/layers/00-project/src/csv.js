// Header row plus data rows, split on a single delimiter. Cells are trimmed.
export function parseCsv(text, delimiter = ',') {
  const body = text.replace(/(\r?\n)+$/, '');
  if (body.trim() === '') return { header: [], rows: [] };
  const split = (line) => line.split(delimiter).map((cell) => cell.trim());
  const [first, ...rest] = body.split(/\r?\n/);
  return { header: split(first), rows: rest.map(split) };
}
