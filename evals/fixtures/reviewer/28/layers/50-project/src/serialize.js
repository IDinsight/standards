import { FIELD_ACCESS, canRead } from './visibility.js';

// Build the response body for one ticket as seen by `role`.
export function serializeTicket(ticket, role) {
  const body = {};
  for (const field of Object.keys(FIELD_ACCESS)) {
    if (canRead(role, field)) body[field] = ticket[field] ?? null;
  }
  return body;
}
