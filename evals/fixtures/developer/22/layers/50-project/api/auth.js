import { readSessionCookie } from '../shared/session.js';

export function authenticate(headers, store) {
  const id = readSessionCookie(headers.cookie);
  const session = id ? store.lookup(id) : null;
  return session ? { userId: session.userId, scopes: session.scopes } : null;
}

export function requireScope(principal, scope) {
  return Boolean(principal && principal.scopes.includes(scope));
}
