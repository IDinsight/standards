// Parse the shop's order export. The first line is a header; each following
// non-empty line is one order. The export never quotes values. Older exports
// have no currency column; their orders are in USD.
const DEFAULT_CURRENCY = 'USD';

export function parseOrders(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map((name) => name.trim());
  return lines.slice(1).map((line, index) => {
    const cells = line.split(',');
    const row = Object.fromEntries(header.map((name, i) => [name, (cells[i] ?? '').trim()]));
    const amount = Number(row.amount);
    if (row.amount === '' || !Number.isFinite(amount)) {
      throw new Error(`line ${index + 2}: invalid amount "${row.amount}"`);
    }
    const currency = (row.currency ?? '').toUpperCase() || DEFAULT_CURRENCY;
    return { id: row.id, customer: row.customer, currency, amount };
  });
}
