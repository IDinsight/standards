import { createRecord, toResponse, updateRecord } from './records.js';

export function getRecord(store, id) {
  const record = store.get(id);
  if (!record) return [404, { error: 'not found' }];
  return [200, toResponse(record)];
}

export function postRecord(store, body, now = new Date()) {
  if (store.get(body.id)) return [409, { error: 'already exists' }];
  try {
    const record = createRecord(body, now);
    store.put(record);
    return [201, toResponse(record)];
  } catch (error) {
    if (error instanceof TypeError) return [400, { error: error.message }];
    throw error;
  }
}

export function patchRecord(store, id, body) {
  const record = store.get(id);
  if (!record) return [404, { error: 'not found' }];
  const next = updateRecord(record, body);
  store.put(next);
  return [200, toResponse(next)];
}
