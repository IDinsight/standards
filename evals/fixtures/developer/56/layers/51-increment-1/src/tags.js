import { TaskValidationError } from './errors.js';

export const MAX_TAG_LENGTH = 24;

export function normalizeTag(value) {
  const tag = String(value).trim().toLowerCase();
  if (tag === '') throw new TaskValidationError('tag must not be empty');
  if (tag.length > MAX_TAG_LENGTH) {
    throw new TaskValidationError('tag must be at most ' + MAX_TAG_LENGTH + ' characters');
  }
  if (tag.includes(',')) throw new TaskValidationError('tag must not contain a comma');
  return tag;
}

export function normalizeTags(values) {
  if (!Array.isArray(values)) throw new TaskValidationError('tags must be a list');
  const tags = [];
  for (const value of values) {
    const tag = normalizeTag(value);
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags;
}
