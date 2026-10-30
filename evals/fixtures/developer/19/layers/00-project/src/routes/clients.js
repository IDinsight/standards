import { requireAdmin, requireSignedIn } from '../auth.js';

function summary(client) {
  return { id: client.id, name: client.name };
}

function details(client) {
  return { id: client.id, name: client.name, email: client.email, phone: client.phone };
}

export function listClients({ actor, store }) {
  requireSignedIn(actor);
  return { status: 200, body: store.list().map(summary) };
}

export function getClient({ actor, store }, id) {
  requireSignedIn(actor);
  const client = store.get(id);
  if (!client) return { status: 404, body: { error: 'not found' } };
  return { status: 200, body: details(client) };
}

export function deleteClient({ actor, store }, id) {
  requireAdmin(actor);
  if (!store.remove(id)) return { status: 404, body: { error: 'not found' } };
  return { status: 204, body: null };
}
