import { findUserByToken } from './store.js';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function authenticate(store, headers = {}) {
  const header = headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  const user = token ? findUserByToken(store, token) : null;
  if (!user) throw new HttpError(401, 'authentication required');
  return user;
}

export function requireAdmin(user) {
  if (!user.admin) throw new HttpError(403, 'admin only');
}
