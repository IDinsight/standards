import { ValidationError } from './records.js';

const NOT_FOUND = { status: 404, body: { error: 'not found' } };

export function getRecord(store, id) {
  const record = store.get(id);
  return record ? { status: 200, body: record } : NOT_FOUND;
}

export function postRecord(store, body) {
  return guard(() => ({ status: 201, body: store.create(body) }));
}

export function patchRecord(store, id, body) {
  return guard(() => {
    const record = store.update(id, body);
    return record ? { status: 200, body: record } : NOT_FOUND;
  });
}

function guard(action) {
  try {
    return action();
  } catch (error) {
    if (error instanceof ValidationError) return { status: 400, body: { error: error.message } };
    throw error;
  }
}
