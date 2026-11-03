export function json(status, body) {
  return {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}

export const notFound = () => json(404, { error: 'not found' });

export const badRequest = (details) => json(400, { error: 'invalid request', details });
