const MIN_QUERY_LENGTH = 2;

export function searchByName(store, rawQuery) {
  const query = (rawQuery ?? '').trim();
  if (query.length < MIN_QUERY_LENGTH) {
    return { status: 400, body: { error: 'query must be at least ' + MIN_QUERY_LENGTH + ' characters' } };
  }
  const needle = query.toLowerCase();
  const results = store.list().filter((contact) => contact.name.toLowerCase().includes(needle));
  return { status: 200, body: { results } };
}
