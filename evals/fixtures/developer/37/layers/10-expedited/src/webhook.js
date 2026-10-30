import { sign } from './signing.js';

const MAX_ATTEMPTS = 3;

function isRetryable(status) {
  return status >= 500;
}

export async function deliver(endpoint, event, { fetchImpl = fetch } = {}) {
  const body = JSON.stringify(event);
  const headers = {
    'content-type': 'application/json',
    'x-hookrelay-signature': sign(body, endpoint.secret),
  };
  let result = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchImpl(endpoint.url, { method: 'POST', headers, body });
      result = { ok: response.ok, status: response.status, attempts: attempt };
      if (!isRetryable(response.status)) return result;
    } catch (error) {
      result = { ok: false, status: 0, attempts: attempt, error: error.message };
    }
  }
  return result;
}
