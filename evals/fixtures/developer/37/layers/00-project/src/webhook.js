import { sign } from './signing.js';

export async function deliver(endpoint, event, { fetchImpl = fetch } = {}) {
  const body = JSON.stringify(event);
  const response = await fetchImpl(endpoint.url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-hookrelay-signature': sign(body, endpoint.secret),
    },
    body,
  });
  return { ok: response.ok, status: response.status };
}
