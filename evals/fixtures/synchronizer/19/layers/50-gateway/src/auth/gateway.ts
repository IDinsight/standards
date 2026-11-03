import { HttpError } from '../http/errors.ts';
import { ROLES, type Role, type User } from './users.ts';

// The service runs behind the company access gateway. The gateway signs users
// in through single sign-on, removes any x-gateway-* headers sent by the
// client, and forwards the signed-in user's identity in these headers.
export const GATEWAY_HEADERS = {
  id: 'x-gateway-user-id',
  name: 'x-gateway-user',
  role: 'x-gateway-role',
} as const;

// The request user for a set of lower-case request headers: null when the
// gateway forwarded no user, HttpError(401) when the forwarded identity is
// incomplete or names an unknown role.
export function userFromGateway(headers: Record<string, string | undefined>): User | null {
  const name = headers[GATEWAY_HEADERS.name]?.trim();
  if (!name) return null;
  const id = Number(headers[GATEWAY_HEADERS.id]);
  const role = headers[GATEWAY_HEADERS.role]?.trim();
  if (!Number.isInteger(id) || id <= 0 || !ROLES.includes(role as Role)) {
    throw new HttpError(401, 'invalid gateway identity');
  }
  return { id, name, role: role as Role };
}
