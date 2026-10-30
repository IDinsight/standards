import { TaskValidationError } from './errors.js';
import { normalizeTag, normalizeTags } from './tags.js';

export const STATUSES = ['open', 'done'];

function requireTitle(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TaskValidationError('title is required');
  }
  return value.trim();
}

function requireStatus(value) {
  if (!STATUSES.includes(value)) {
    throw new TaskValidationError('status must be one of ' + STATUSES.join(', '));
  }
  return value;
}

export function createTask(store, { title, status = 'open', tags = [] } = {}) {
  return store.insert({
    title: requireTitle(title),
    status: requireStatus(status),
    tags: normalizeTags(tags),
  });
}

export function updateTask(store, id, changes = {}) {
  const current = store.get(id);
  if (!current) return null;
  const next = { ...current };
  if ('title' in changes) next.title = requireTitle(changes.title);
  if ('status' in changes) next.status = requireStatus(changes.status);
  if ('tags' in changes) next.tags = normalizeTags(changes.tags);
  store.replace(next);
  return store.get(id);
}

export function listTasks(store, { status, tag } = {}) {
  const wanted = tag === undefined ? null : normalizeTag(tag);
  return store.all().filter((task) => (status === undefined || task.status === status)
    && (wanted === null || task.tags.includes(wanted)));
}
