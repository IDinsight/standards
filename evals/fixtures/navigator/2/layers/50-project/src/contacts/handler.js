import { normalizeContact } from './normalize.js';
import { validateContact } from './validate.js';

export async function createContact(request, { store }) {
  const errors = validateContact(request.body);
  if (errors.length > 0) {
    return { status: 400, body: { errors } };
  }
  const contact = normalizeContact(request.body);
  const saved = await store.save(contact);
  return { status: 201, body: saved };
}

export async function getContact(request, { store }) {
  const contact = await store.get(Number(request.params[0]));
  return contact ? { status: 200, body: contact } : { status: 404, body: { error: 'not found' } };
}
