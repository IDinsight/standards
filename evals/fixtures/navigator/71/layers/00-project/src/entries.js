import { validateEntry } from './validate.js';

export class ValidationError extends Error {
  constructor(errors) {
    super(errors.join('; '));
    this.errors = errors;
  }
}

export function createEntry(store, input) {
  const errors = validateEntry(input);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
  return store.save({
    project: input.project.trim(),
    date: input.date,
    hours: input.hours,
  });
}
