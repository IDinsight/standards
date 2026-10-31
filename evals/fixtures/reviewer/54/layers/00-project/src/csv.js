export function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return { header: [], rows: [] };
  const header = lines[0].split(',').map((cell) => cell.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(',');
    return Object.fromEntries(header.map((name, i) => [name, (cells[i] ?? '').trim()]));
  });
  return { header, rows };
}
