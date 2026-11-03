import { formatCents } from './money.js';

function row(label, cents) {
  return `  ${label.padEnd(14)}${formatCents(cents).padStart(12)}`;
}

export function renderText(summary) {
  const lines = [`Expenses for ${summary.month}`];
  for (const category of summary.categories) lines.push(row(category.name, category.totalCents));
  lines.push(row('Total', summary.totalCents));
  return lines.join('\n');
}

export function renderJson(summary) {
  return JSON.stringify({
    month: summary.month,
    categories: summary.categories.map((category) => ({
      name: category.name,
      total: formatCents(category.totalCents),
    })),
    total: formatCents(summary.totalCents),
  }, null, 2);
}
