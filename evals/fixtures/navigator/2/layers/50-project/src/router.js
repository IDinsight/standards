import { createContact, getContact } from './contacts/handler.js';

const routes = [
  { method: 'POST', pattern: /^\/contacts$/, handler: createContact },
  { method: 'GET', pattern: /^\/contacts\/(\d+)$/, handler: getContact },
];

export async function route(request, deps) {
  for (const entry of routes) {
    const match = entry.pattern.exec(request.path);
    if (match && entry.method === request.method) {
      return entry.handler({ ...request, params: match.slice(1) }, deps);
    }
  }
  return { status: 404, body: { error: 'not found' } };
}
