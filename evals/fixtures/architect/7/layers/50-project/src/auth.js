export class AuthError extends Error {}

// Resolve the `Authorization: Bearer <key>` header to an account id.
export function authenticate(headers, store) {
  const header = headers.authorization ?? '';
  const match = /^Bearer\s+(\S+)$/.exec(header);
  if (!match) throw new AuthError('missing bearer token');
  const record = store.lookup(match[1]);
  if (!record) throw new AuthError('invalid API key');
  return record.accountId;
}
