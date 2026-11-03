import { verifyToken } from '../auth/token.js';

export function handleRequest(req, { secret, routes }) {
  const header = req.headers?.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const result = verifyToken(token, secret);
  if (!result.ok) return { status: 401, body: { error: result.reason } };
  const route = routes[req.path];
  if (!route) return { status: 404, body: { error: 'not found' } };
  return route(req, result.payload);
}
