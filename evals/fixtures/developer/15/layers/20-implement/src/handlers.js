import { verifySession } from './session.js';

function bearer(header) {
  const match = /^Bearer (\S+)$/.exec(header ?? '');
  return match ? match[1] : '';
}

export async function getAccount(request, { store, keys, now = Date.now }) {
  let claims;
  try {
    claims = verifySession(bearer(request.headers.authorization), keys, now());
  } catch (error) {
    // Let the client tell an expired session apart from other failures.
    return { status: 401, body: { error: error.message } };
  }
  try {
    const account = await store.find(claims.sub);
    if (!account) return { status: 404, body: { error: 'not found' } };
    return { status: 200, body: account };
  } catch {
    return { status: 500, body: { error: 'internal error' } };
  }
}
