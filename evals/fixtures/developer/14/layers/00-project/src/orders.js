import { readFileSync } from 'node:fs';

// Parse an amount such as "12.5" or "12.50" into integer cents.
export function toCents(text) {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text.trim());
  if (!match) throw new Error('Invalid amount: ' + text);
  return Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
}

export function parseOrders(text) {
  const [header, ...rows] = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (header === undefined) return [];
  const columns = header.split(',').map((name) => name.trim());
  return rows.map((line) => {
    const values = line.split(',');
    const record = Object.fromEntries(columns.map((name, index) => [name, (values[index] ?? '').trim()]));
    return { id: record.id, customer: record.customer, amountCents: toCents(record.amount), date: record.date };
  });
}

export function loadOrders(file) {
  return parseOrders(readFileSync(file, 'utf8'));
}

export function summarize(orders) {
  return {
    count: orders.length,
    totalCents: orders.reduce((sum, order) => sum + order.amountCents, 0),
  };
}
