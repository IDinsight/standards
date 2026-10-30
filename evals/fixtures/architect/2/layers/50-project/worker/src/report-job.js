export function totalsByCategory(expenses) {
  const totals = {};
  for (const expense of expenses) {
    totals[expense.category] = (totals[expense.category] ?? 0) + expense.amountCents;
  }
  return totals;
}

export async function runNightlyReport({ api, period }) {
  const expenses = (await api.get('/expenses')).filter((expense) => expense.date.startsWith(period));
  return api.post('/reports', { period, count: expenses.length, totals: totalsByCategory(expenses) });
}
