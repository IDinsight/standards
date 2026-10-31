export const FORMATS = ['csv', 'json'];
export const COLUMNS = ['date', 'account', 'description', 'amount'];

export function selectRecords(records, { from, to, account } = {}) {
  return records
    .filter((record) => !from || record.date >= from)
    .filter((record) => !to || record.date <= to)
    .filter((record) => !account || record.account === account)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function cell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(records) {
  const lines = records.map((record) => COLUMNS.map((column) => cell(record[column])).join(','));
  return `${[COLUMNS.join(','), ...lines].join('\n')}\n`;
}

export function toJson(records) {
  const rows = records.map((record) => Object.fromEntries(COLUMNS.map((column) => [column, record[column]])));
  return `${JSON.stringify(rows, null, 2)}\n`;
}

export function render(records, format) {
  if (format === 'csv') return toCsv(records);
  if (format === 'json') return toJson(records);
  throw new Error(`Unknown format "${format}"; use ${FORMATS.join(' or ')}.`);
}
