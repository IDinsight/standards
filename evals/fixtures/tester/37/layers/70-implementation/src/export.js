export const COLUMNS = ['sku', 'name', 'quantity', 'location'];

function csvCell(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(items) {
  const lines = items.map((item) => COLUMNS.map((column) => csvCell(item[column])).join(','));
  return [COLUMNS.join(','), ...lines].join('\n') + '\n';
}

export function toJson(items) {
  const rows = items.map((item) => Object.fromEntries(COLUMNS.map((column) => [column, item[column]])));
  return JSON.stringify(rows, null, 2) + '\n';
}

export const FORMATS = { csv: toCsv, json: toJson };
