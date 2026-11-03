const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(body) {
  const errors = [];
  if (typeof body.name !== 'string' || body.name.trim() === '') {
    errors.push('name is required');
  } else if (body.name.trim().length > 80) {
    errors.push('name must be at most 80 characters');
  }
  if (typeof body.email !== 'string' || !EMAIL.test(body.email.trim())) {
    errors.push('email must be a valid address');
  }
  if (body.phone !== undefined && typeof body.phone !== 'string') {
    errors.push('phone must be a string');
  }
  return errors;
}
