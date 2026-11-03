const DEFAULT_PAGE_SIZE = 20;

function matches(record, needle) {
  return record.name.toLowerCase().includes(needle) || record.email.toLowerCase().includes(needle);
}

export function searchRecords(store, params) {
  const q = (params.get('q') ?? '').trim();
  if (!q) return { status: 400, body: { error: 'q is required' } };
  const needle = q.toLowerCase();
  const page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  const pageSize = Math.max(1, Number.parseInt(params.get('pageSize'), 10) || DEFAULT_PAGE_SIZE);
  const found = store.all().filter((record) => matches(record, needle));
  const start = (page - 1) * pageSize;
  return {
    status: 200,
    body: { items: found.slice(start, start + pageSize), page, pageSize, total: found.length },
  };
}
