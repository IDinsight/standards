const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup(body) {
  const errors = [];
  if (typeof body?.name !== 'string' || body.name.trim() === '') {
    errors.push('name is required');
  } else if (body.name.trim().length > 80) {
    errors.push('name must be at most 80 characters');
  }
  if (typeof body?.email !== 'string' || !EMAIL.test(body.email.trim())) {
    errors.push('email is invalid');
  }
  return errors;
}
