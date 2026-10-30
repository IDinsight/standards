// Parsing for stock snapshot files (JSON Lines).

export function parseRecords(text) {
  const records = [];
  text.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    let value;
    try {
      value = JSON.parse(trimmed);
    } catch {
      throw new Error(`line ${index + 1}: not valid JSON`);
    }
    if (typeof value?.sku !== 'string' || !Number.isInteger(value.qty) || value.qty < 0) {
      throw new Error(`line ${index + 1}: expected sku and a non-negative integer qty`);
    }
    records.push({ sku: value.sku, qty: value.qty, location: value.location ?? null });
  });
  return records;
}

export function totalQuantity(records) {
  return records.reduce((sum, record) => sum + record.qty, 0);
}
