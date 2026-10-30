export function parseExpenses(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];
  const [header, ...rows] = lines;
  if (header.trim() !== 'date,category,amount') {
    throw new Error('Unexpected header: ' + header);
  }
  return rows.map((line, index) => {
    const [date = '', category = '', amount = ''] = line.split(',');
    const value = Number(amount);
    if (amount.trim() === '' || !Number.isFinite(value)) {
      throw new Error('Line ' + (index + 2) + ': invalid amount ' + amount);
    }
    return { date: date.trim(), category: category.trim(), amount: value };
  });
}

export function totalsByCategory(expenses) {
  const totals = new Map();
  for (const { category, amount } of expenses) {
    totals.set(category, (totals.get(category) ?? 0) + amount);
  }
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function filterByDate(expenses, { from, to } = {}) {
  return expenses.filter(
    ({ date }) => (from === undefined || date >= from) && (to === undefined || date <= to),
  );
}
