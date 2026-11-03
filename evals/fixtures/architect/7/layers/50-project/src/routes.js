import { AuthError, authenticate } from './auth.js';

function withAccount(store, headers, handler) {
  let accountId;
  try {
    accountId = authenticate(headers, store);
  } catch (error) {
    if (error instanceof AuthError) return { status: 401, body: { error: error.message } };
    throw error;
  }
  return handler(accountId);
}

// Operator provisioning: issues the first key for an account.
export function createKey(store, accountId) {
  try {
    return { status: 201, body: { key: store.issue(accountId) } };
  } catch (error) {
    return { status: 409, body: { error: error.message } };
  }
}

// POST /account/key/rotate, authenticated with the key being replaced.
export function rotateKey(store, headers) {
  return withAccount(store, headers, (accountId) => ({
    status: 200,
    body: { key: store.rotate(accountId) },
  }));
}

// GET /account
export function getAccount(store, headers) {
  return withAccount(store, headers, (accountId) => ({ status: 200, body: { accountId } }));
}
