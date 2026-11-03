import { validateSignup } from '../validate.js';

export function createSignup(store, body) {
  const errors = validateSignup(body);
  if (errors.length > 0) {
    return { status: 400, body: { errors } };
  }

  const email = body.email.trim().toLowerCase();
  if (store.findByEmail(email)) {
    return { status: 409, body: { errors: ['email already registered'] } };
  }

  const row = store.insert({ name: body.name.trim(), email });
  return { status: 201, body: { id: row.id, name: row.name, email: row.email } };
}
