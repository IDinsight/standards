import { updateRecord } from './record.js';

// Update handler: body is a partial record. Returns [status, body].
export function handleUpdate(store, id, body) {
  const record = store.get(id);
  if (!record) return [404, { error: 'not found' }];
  try {
    const next = updateRecord(record, body);
    store.set(id, next);
    return [200, next];
  } catch (error) {
    return [400, { error: error.message }];
  }
}
