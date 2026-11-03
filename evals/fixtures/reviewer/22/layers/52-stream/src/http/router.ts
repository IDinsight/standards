import { HttpError } from './errors.ts';
import { json, type AppRequest, type AppResponse } from './messages.ts';

export type Handler = (request: AppRequest) => AppResponse | Promise<AppResponse>;

type Route = { method: AppRequest['method']; path: string; handler: Handler };

export class Router {
  #routes: Route[] = [];

  get(path: string, handler: Handler): void {
    this.#routes.push({ method: 'GET', path, handler });
  }

  post(path: string, handler: Handler): void {
    this.#routes.push({ method: 'POST', path, handler });
  }

  // Handlers may be synchronous or return a promise; errors from either are
  // mapped to responses the same way.
  async handle(request: AppRequest): Promise<AppResponse> {
    const route = this.#routes.find((candidate) => candidate.path === request.path && candidate.method === request.method);
    if (!route) {
      const known = this.#routes.some((candidate) => candidate.path === request.path);
      return known ? json(405, { error: 'method not allowed' }) : json(404, { error: 'not found' });
    }
    try {
      return await route.handler(request);
    } catch (error) {
      if (error instanceof HttpError) return json(error.status, { error: error.message });
      return json(500, { error: 'internal error' });
    }
  }
}
