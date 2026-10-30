import { HttpError } from './errors.js';
import { json } from './messages.js';

// Longest query string any route accepts, measured URL-encoded, in bytes.
export const MAX_QUERY_BYTES = 2048;

export function queryBytes(query = {}) {
  return Buffer.byteLength(new URLSearchParams(query).toString(), 'utf8');
}

export class Router {
  #routes = [];

  get(path, handler) {
    this.#routes.push({ method: 'GET', path, handler });
  }

  post(path, handler) {
    this.#routes.push({ method: 'POST', path, handler });
  }

  handle(request) {
    if (queryBytes(request.query) > MAX_QUERY_BYTES) {
      return json(414, { error: 'query too long' });
    }
    const route = this.#routes.find((candidate) => candidate.path === request.path && candidate.method === request.method);
    if (!route) {
      const known = this.#routes.some((candidate) => candidate.path === request.path);
      return known ? json(405, { error: 'method not allowed' }) : json(404, { error: 'not found' });
    }
    try {
      return route.handler(request);
    } catch (error) {
      if (error instanceof HttpError) return json(error.status, { error: error.message });
      return json(500, { error: 'internal error' });
    }
  }
}
