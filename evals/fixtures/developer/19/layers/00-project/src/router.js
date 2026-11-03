import { ForbiddenError } from './auth.js';
import { deleteClient, getClient, listClients } from './routes/clients.js';

const routes = [
  ['GET', /^\/clients$/, (ctx) => listClients(ctx)],
  ['GET', /^\/clients\/(\d+)$/, (ctx, id) => getClient(ctx, Number(id))],
  ['DELETE', /^\/clients\/(\d+)$/, (ctx, id) => deleteClient(ctx, Number(id))],
];

export function handle({ method, path, actor }, { store }) {
  for (const [routeMethod, pattern, handler] of routes) {
    if (routeMethod !== method) continue;
    const match = pattern.exec(path);
    if (!match) continue;
    try {
      return handler({ actor, store }, ...match.slice(1));
    } catch (error) {
      if (error instanceof ForbiddenError) return { status: 403, body: { error: error.message } };
      throw error;
    }
  }
  return { status: 404, body: { error: 'not found' } };
}
