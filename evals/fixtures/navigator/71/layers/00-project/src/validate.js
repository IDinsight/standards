const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validateEntry(input) {
  const errors = [];
  if (typeof input.project !== 'string' || input.project.trim() === '') {
    errors.push('project is required');
  }
  if (typeof input.date !== 'string' || !DATE.test(input.date)) {
    errors.push('date must be YYYY-MM-DD');
  }
  if (typeof input.hours !== 'number' || !(input.hours > 0 && input.hours <= 24)) {
    errors.push('hours must be greater than 0 and at most 24');
  }
  return errors;
}
