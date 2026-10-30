const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export function listRecords(store, params) {
  const page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  const requested = Number.parseInt(params.get('pageSize'), 10) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requested));
  const all = store.all();
  const start = (page - 1) * pageSize;
  return { items: all.slice(start, start + pageSize), page, pageSize, total: all.length };
}
