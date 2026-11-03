const COLUMNS = ['id', 'title', 'tags'];

function field(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}

export function toCsv(items) {
  const rows = items.map((item) => [item.id, item.title, item.tags.join(';')].map(field).join(','));
  return [COLUMNS.join(','), ...rows].join('\n');
}
