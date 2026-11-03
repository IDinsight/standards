export function formatTable(items) {
  if (items.length === 0) return 'No items.';
  const header = ['SKU', 'NAME', 'QTY'];
  const rows = items.map((item) => [item.sku, item.name, String(item.quantity)]);
  const widths = header.map((title, index) => Math.max(title.length, ...rows.map((row) => row[index].length)));
  return [header, ...rows]
    .map((row) => row.map((cell, index) => cell.padEnd(widths[index])).join('  ').trimEnd())
    .join('\n');
}
