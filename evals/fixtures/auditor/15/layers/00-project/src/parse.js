// Minimal CSV reader: the first non-blank line is the header. Fields are split
// on the delimiter and trimmed; quoted fields are not supported.
export function parseCsv(text, delimiter = ',') {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return { header: [], rows: [] };
  const header = lines[0].split(delimiter).map((cell) => cell.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(delimiter);
    return Object.fromEntries(header.map((name, index) => [name, (cells[index] ?? '').trim()]));
  });
  return { header, rows };
}
