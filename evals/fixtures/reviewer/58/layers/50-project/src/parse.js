const DATE = /^\d{4}-\d{2}-\d{2}$/;
const COLUMNS = ['date', 'project', 'hours'];

export class InputError extends Error {}

export function parseEntries(text) {
  const lines = text.split(/\r?\n/)
    .map((line, i) => ({ line, number: i + 1 }))
    .filter(({ line }) => line.trim() !== '');
  if (lines.length === 0) return [];
  const header = lines[0].line.split(',').map((cell) => cell.trim().toLowerCase());
  for (const column of COLUMNS) {
    if (!header.includes(column)) throw new InputError(`missing column: ${column}`);
  }
  const index = Object.fromEntries(COLUMNS.map((column) => [column, header.indexOf(column)]));
  return lines.slice(1).map(({ line, number }) => {
    const cells = line.split(',').map((cell) => cell.trim());
    const date = cells[index.date] ?? '';
    const raw = cells[index.hours] ?? '';
    const hours = raw === '' ? Number.NaN : Number(raw);
    if (!DATE.test(date)) throw new InputError(`line ${number}: date must be YYYY-MM-DD`);
    if (!Number.isFinite(hours) || hours < 0) {
      throw new InputError(`line ${number}: hours must be a non-negative number`);
    }
    return { date, project: cells[index.project] ?? '', hours };
  });
}
