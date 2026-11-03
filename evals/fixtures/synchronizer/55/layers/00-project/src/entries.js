import { readFileSync } from 'node:fs';

export function parseEntries(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  const [header, ...rows] = lines;
  if (header?.trim() !== 'date,amount,category') {
    throw new Error('Expected header: date,amount,category');
  }
  return rows.map((row, index) => {
    const [date, amount, category] = row.split(',');
    const value = Number(amount);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(value) || !category) {
      throw new Error(`Invalid entry on line ${index + 2}: ${row}`);
    }
    return { date, amount: value, category: category.trim() };
  });
}

export function readEntries(file) {
  return parseEntries(readFileSync(file, 'utf8'));
}
