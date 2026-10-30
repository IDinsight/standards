export class ValidationError extends Error {
  constructor(field, message) {
    super(field + ': ' + message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export function requiredText(value, max, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(field, 'is required');
  }
  const text = value.trim();
  if (text.length > max) throw new ValidationError(field, 'must be at most ' + max + ' characters');
  return text;
}

export function optionalText(value, max, field) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw new ValidationError(field, 'must be a string');
  const text = value.trim();
  if (text === '') return null;
  if (text.length > max) throw new ValidationError(field, 'must be at most ' + max + ' characters');
  return text;
}

export function oneOf(value, allowed, field, fallback) {
  if (value === undefined) return fallback;
  if (!allowed.includes(value)) {
    throw new ValidationError(field, 'must be one of ' + allowed.join(', '));
  }
  return value;
}
