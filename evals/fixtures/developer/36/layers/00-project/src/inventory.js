export function parseInventory(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines[0]?.trim().toLowerCase() === 'sku,name,qty') lines.shift();
  return lines.map((line, index) => {
    const [sku, name, qty] = line.split(',').map((part) => part.trim());
    const count = Number(qty);
    if (!sku || !name || !Number.isInteger(count) || count < 0) {
      throw new Error(`invalid inventory line ${index + 1}: ${line}`);
    }
    return { sku, name, qty: count };
  });
}

export function totalUnits(items) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}
