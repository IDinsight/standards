export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const PRIORITIES = ['low', 'normal', 'high'];

export function createTask({ id, title, priority = 'normal' } = {}) {
  if (!Number.isInteger(id) || id < 1) {
    throw new ValidationError('id must be a positive integer');
  }
  if (typeof title !== 'string' || title.trim() === '') {
    throw new ValidationError('title is required');
  }
  if (!PRIORITIES.includes(priority)) {
    throw new ValidationError(`priority must be one of ${PRIORITIES.join(', ')}`);
  }
  return { id, title: title.trim(), priority, done: false };
}

export function completeTask(task) {
  return { ...task, done: true };
}
