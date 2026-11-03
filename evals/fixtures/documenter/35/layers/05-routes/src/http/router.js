import { HttpError } from './errors.js';
import { json } from './messages.js';

export class Router {
  #routes = [];

  get(path, handler) {
    this.#routes.push({ method: 'GET', path, handler });
  }

  post(path, handler) {
    this.#routes.push({ method: 'POST', path, handler });
  }

  handle(request) {
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
