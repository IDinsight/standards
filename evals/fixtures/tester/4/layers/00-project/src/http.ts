import type { User } from './auth.ts';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type AppRequest = { method: 'GET' | 'POST'; path: string; query: Record<string, string>; user: User | null; body?: string };
export type AppResponse = { status: number; headers: Record<string, string>; body: string };
export type Handler = (request: AppRequest) => AppResponse;

export function json(status: number, data: unknown): AppResponse {
  return { status, headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(data) };
}

export class Router {
  #routes: { method: string; path: string; handler: Handler }[] = [];

  add(method: AppRequest['method'], path: string, handler: Handler): void {
    this.#routes.push({ method, path, handler });
  }

  handle(request: AppRequest): AppResponse {
    const route = this.#routes.find((r) => r.method === request.method && r.path === request.path);
    if (!route) return json(404, { error: 'not found' });
    try {
      return route.handler(request);
    } catch (error) {
      if (error instanceof HttpError) return json(error.status, { error: error.message });
      return json(500, { error: 'internal error' });
    }
  }
}
