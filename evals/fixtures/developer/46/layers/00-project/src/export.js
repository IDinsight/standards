const COLUMNS = ['id', 'title', 'tags'];

export function toCsv(items) {
  const rows = items.map((item) => [item.id, item.title, item.tags.join(';')].join(','));
  return [COLUMNS.join(','), ...rows].join('\n');
}
