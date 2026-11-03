// Parse bank-export CSV text into transaction objects.
const REQUIRED = ['date', 'description', 'amount'];

export function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map((name) => name.trim().toLowerCase());
  for (const name of REQUIRED) {
    if (!header.includes(name)) throw new Error('missing column: ' + name);
  }
  return lines.slice(1).map((line, index) => {
    const cells = line.split(',');
    const row = Object.fromEntries(header.map((name, i) => [name, (cells[i] ?? '').trim()]));
    return toTransaction(row, index + 2);
  });
}

export function toTransaction(row, lineNumber) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
    throw new Error('line ' + lineNumber + ': invalid date "' + row.date + '"');
  }
  const amount = Number(row.amount);
  if (!Number.isFinite(amount)) {
    throw new Error('line ' + lineNumber + ': invalid amount "' + row.amount + '"');
  }
  return {
    date: row.date,
    description: row.description,
    amountCents: Math.round(amount * 100),
    category: row.category || 'uncategorized',
  };
}
