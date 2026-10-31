// Totals for one calendar month. Amounts are integer cents; spending is
// reported as a positive number.
export function monthSummary(entries, month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new RangeError(`invalid month: ${month}`);
  const inMonth = entries.filter((entry) => entry.date.startsWith(`${month}-`));
  let income = 0;
  let spending = 0;
  for (const entry of inMonth) {
    if (entry.amount >= 0) income += entry.amount;
    else spending -= entry.amount;
  }
  return { month, count: inMonth.length, income, spending, net: income - spending };
}

export function formatCents(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}
