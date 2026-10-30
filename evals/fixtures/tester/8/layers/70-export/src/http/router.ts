import { HttpError } from './errors.ts';
import { json, type AppRequest, type AppResponse } from './messages.ts';

export type Handler = (request: AppRequest) => AppResponse | Promise<AppResponse>;

type Route = { method: AppRequest['method']; path: string; handler: Handler };

function errorResponse(error: unknown): AppResponse {
  if (error instanceof HttpError) return json(error.status, { error: error.message });
  return json(500, { error: 'internal error' });
}

export class Router {
  #routes: Route[] = [];

  get(path: string, handler: Handler): void {
    this.#routes.push({ method: 'GET', path, handler });
  }

  post(path: string, handler: Handler): void {
    this.#routes.push({ method: 'POST', path, handler });
  }

  // A synchronous handler's response is returned as is; a handler that returns
  // a promise yields a promise whose rejection is mapped like a thrown error.
  handle(request: AppRequest): AppResponse | Promise<AppResponse> {
    const route = this.#routes.find((candidate) => candidate.path === request.path && candidate.method === request.method);
    if (!route) {
      const known = this.#routes.some((candidate) => candidate.path === request.path);
      return known ? json(405, { error: 'method not allowed' }) : json(404, { error: 'not found' });
    }
    try {
      const result = route.handler(request);
      return result instanceof Promise ? result.catch(errorResponse) : result;
    } catch (error) {
      return errorResponse(error);
    }
  }
}
