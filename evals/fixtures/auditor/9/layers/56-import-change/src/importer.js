const REQUIRED = ['sku', 'name', 'quantity'];

// Supplier files use semicolons; our own exports use commas.
function delimiterFor(headerLine) {
  return headerLine.includes(';') && !headerLine.includes(',') ? ';' : ',';
}

export function parseProducts(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return { products: [], skipped: 0 };
  const delimiter = delimiterFor(lines[0]);
  const header = lines[0].split(delimiter).map((cell) => cell.trim());
  for (const column of REQUIRED) {
    if (!header.includes(column)) throw new Error(`missing column: ${column}`);
  }
  const products = [];
  let skipped = 0;
  for (const line of lines.slice(1)) {
    const cells = line.split(delimiter).map((cell) => cell.trim());
    const row = Object.fromEntries(header.map((name, index) => [name, cells[index] ?? '']));
    const quantity = Number(row.quantity);
    if (!row.sku || !Number.isInteger(quantity) || quantity < 0) {
      skipped += 1;
      continue;
    }
    products.push({ sku: row.sku, name: row.name, quantity });
  }
  return { products, skipped };
}

export function importProducts(catalog, text) {
  const { products, skipped } = parseProducts(text);
  for (const product of products) catalog.upsert(product);
  return { imported: products.length, skipped };
}
