const COLUMNS = ['id', 'customer', 'total', 'placed_at'];

// Quote a field when it contains a comma, a double quote, or a line break,
// doubling any embedded quotes (RFC 4180).
function cell(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function ordersToCsv(orders) {
  const rows = orders.map((order) => [order.id, order.customer, order.total, order.placedAt].map(cell).join(','));
  return [COLUMNS.map(cell).join(','), ...rows].join('\n');
}
