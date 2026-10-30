export function stockReport(items) {
  const sorted = [...items].sort((a, b) => a.sku.localeCompare(b.sku));
  const lines = sorted.map((item) => `${item.sku}  ${item.name}  ${item.quantity}`);
  lines.push(`${items.length} items`);
  return lines.join('\n');
}
