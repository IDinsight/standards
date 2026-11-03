import { formatCents } from './money.js';

function row(label, cents) {
  return `  ${label.padEnd(14)}${formatCents(cents).padStart(12)}`;
}

export function monthlyReport(records, month) {
  const totals = new Map();
  for (const record of records) {
    if (!record.date.startsWith(month)) continue;
    totals.set(record.category, (totals.get(record.category) ?? 0) + record.amountCents);
  }
  const lines = [`Expenses for ${month}`];
  let total = 0;
  for (const category of [...totals.keys()].sort()) {
    lines.push(row(category, totals.get(category)));
    total += totals.get(category);
  }
  lines.push(row('Total', total));
  return lines.join('\n');
}
