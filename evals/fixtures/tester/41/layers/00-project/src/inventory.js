export function parseInventory(text) {
  const [header, ...rows] = text.trim().split('\n');
  const columns = header.split(',').map((column) => column.trim());
  return rows
    .filter((row) => row.trim())
    .map((row) => {
      const values = row.split(',').map((value) => value.trim());
      const record = Object.fromEntries(columns.map((column, index) => [column, values[index]]));
      return {
        sku: record.sku,
        name: record.name,
        quantity: Number(record.quantity),
        reorderLevel: Number(record.reorder_level),
      };
    });
}

export function totalUnits(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
