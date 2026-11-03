import { createServer, type IncomingHttpHeaders, type Server } from 'node:http';

import type { App } from '../app.ts';
import { ROLES, type Role, type User } from '../auth/users.ts';
import { json, type AppRequest, type AppResponse } from './messages.ts';

// The gateway in front of the service signs users in and forwards them in the
// x-user-id, x-user-name, and x-user-role headers.
export function userFromHeaders(headers: IncomingHttpHeaders): User | null {
  const id = Number(headers['x-user-id']);
  const name = headers['x-user-name'];
  const role = headers['x-user-role'];
  if (!Number.isInteger(id) || id <= 0 || typeof name !== 'string' || !name) return null;
  if (typeof role !== 'string' || !ROLES.includes(role as Role)) return null;
  return { id, name, role: role as Role };
}

export function createHttpServer(app: App): Server {
  return createServer((incoming, outgoing) => {
    const url = new URL(incoming.url ?? '/', 'http://records-admin');
    const method = incoming.method;
    let response: AppResponse;
    if (url.pathname === '/healthz') {
      response = { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' }, body: 'ok' };
    } else if (method !== 'GET' && method !== 'POST') {
      response = json(405, { error: 'method not allowed' });
    } else {
      const request: AppRequest = {
        method,
        path: url.pathname,
        query: Object.fromEntries(url.searchParams),
        user: userFromHeaders(incoming.headers),
      };
      response = app.handle(request);
    }
    outgoing.writeHead(response.status, response.headers);
    outgoing.end(response.body);
  });
}
