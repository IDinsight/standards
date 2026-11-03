import { toCents } from './money.js';

export function parseRecords(text) {
  const [header, ...rows] = text.trim().split(/\r?\n/);
  const columns = header.split(',').map((name) => name.trim());
  return rows
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const cells = line.split(',');
      const row = Object.fromEntries(columns.map((name, index) => [name, (cells[index] ?? '').trim()]));
      return { date: row.date, category: row.category, amountCents: toCents(row.amount) };
    });
}
