export const COLUMNS = ['sku', 'name', 'quantity', 'location'];

function csvCell(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(items) {
  const lines = items.map((item) => COLUMNS.map((column) => csvCell(item[column])).join(','));
  return [COLUMNS.join(','), ...lines].join('\n') + '\n';
}
