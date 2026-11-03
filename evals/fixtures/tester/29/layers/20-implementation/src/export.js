import { formatCents } from './money.js';

export const CSV_COLUMNS = ['id', 'customer', 'status', 'total', 'created_at'];

// RFC 4180: quote a value that contains a comma, double quote, or line break,
// and double any quotes inside it.
function cell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function ordersToCsv(orders) {
  const lines = [CSV_COLUMNS.join(',')];
  for (const order of orders) {
    const values = [order.id, order.customer, order.status, formatCents(order.total), order.createdAt];
    lines.push(values.map(cell).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}
