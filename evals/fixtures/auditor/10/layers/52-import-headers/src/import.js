export class ImportError extends Error {}

const REQUIRED = ['sku', 'name', 'price'];

function columnIndexes(headerLine) {
  const names = headerLine.split(',').map((name) => name.trim().toLowerCase());
  const indexes = {};
  for (const column of REQUIRED) {
    const index = names.indexOf(column);
    if (index === -1) throw new ImportError(`missing column ${column}`);
    indexes[column] = index;
  }
  return { indexes, width: names.length };
}

export function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((line) => line.trim() !== '');
  if (lines.length === 0) throw new ImportError('empty file');
  const { indexes, width } = columnIndexes(lines[0]);
  return lines.slice(1).map((line, index) => {
    const cells = line.split(',').map((cell) => cell.trim());
    if (cells.length !== width) {
      throw new ImportError(`line ${index + 2}: expected ${width} fields`);
    }
    const price = Number(cells[indexes.price]);
    if (!Number.isFinite(price)) throw new ImportError(`line ${index + 2}: invalid price`);
    return { sku: cells[indexes.sku], name: cells[indexes.name], price };
  });
}

export function importCsv(store, text) {
  const products = parseCsv(text);
  for (const product of products) store.put(product);
  return { imported: products.length };
}
