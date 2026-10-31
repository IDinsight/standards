// Parse a bank statement export: one row per line, columns date, description, amount.
export function parseLines(text, { delimiter = ',', skipHeader = true } = {}) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  const body = skipHeader ? lines.slice(1) : lines;
  const offset = skipHeader ? 2 : 1;
  return body.map((line, index) => {
    const [date, description, amount] = line.split(delimiter).map((cell) => cell.trim());
    const cents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(cents)) {
      throw new Error(`line ${index + offset}: invalid amount "${amount}"`);
    }
    return { date, description, cents };
  });
}

export function summarize(rows, currency) {
  const totalCents = rows.reduce((sum, row) => sum + row.cents, 0);
  return { currency, count: rows.length, totalCents };
}
