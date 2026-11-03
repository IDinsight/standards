function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function notFound() {
  return { status: 404, body: { error: 'not found' } };
}

export function createRecord(store, body) {
  if (typeof body?.title !== 'string' || body.title.trim() === '') {
    return { status: 400, body: { error: 'title is required' } };
  }
  const record = store.create({ title: body.title.trim(), body: body.body ?? '' });
  return { status: 201, body: record };
}

export function getRecord(store, rawId) {
  const id = parseId(rawId);
  const record = id === null ? null : store.get(id);
  return record ? { status: 200, body: record } : notFound();
}

export function listRecords(store, query = {}) {
  const term = (query.q ?? '').toLowerCase();
  const records = store.list().filter((record) => record.title.toLowerCase().includes(term));
  return { status: 200, body: records };
}

export function updateRecord(store, rawId, body) {
  const id = parseId(rawId);
  const record = id === null ? null : store.update(id, body ?? {});
  return record ? { status: 200, body: record } : notFound();
}

export function deleteRecord(store, rawId) {
  const id = parseId(rawId);
  if (id === null || !store.delete(id)) return notFound();
  return { status: 204, body: null };
}
