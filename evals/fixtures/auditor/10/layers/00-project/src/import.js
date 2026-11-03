export class ImportError extends Error {}

const COLUMNS = ['sku', 'name', 'price'];

export function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((line) => line !== '');
  if (lines.length === 0) throw new ImportError('empty file');
  const header = lines[0].split(',');
  if (header.join(',') !== COLUMNS.join(',')) {
    throw new ImportError(`expected header ${COLUMNS.join(',')}`);
  }
  return lines.slice(1).map((line, index) => {
    const cells = line.split(',');
    if (cells.length !== COLUMNS.length) {
      throw new ImportError(`line ${index + 2}: expected ${COLUMNS.length} fields`);
    }
    const price = Number(cells[2]);
    if (!Number.isFinite(price)) throw new ImportError(`line ${index + 2}: invalid price`);
    return { sku: cells[0], name: cells[1], price };
  });
}

export function importCsv(store, text) {
  const products = parseCsv(text);
  for (const product of products) store.put(product);
  return { imported: products.length };
}
