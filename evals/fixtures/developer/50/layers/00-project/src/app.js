export function createApp({ users }) {
  return function handle(request) {
    const { method, path } = request;
    if (method === 'GET' && path === '/health') return json(200, { ok: true });
    if (method === 'POST' && path === '/users') return register(users, request.body ?? {});
    return json(404, { error: 'not found' });
  };
}

function register(users, body) {
  try {
    return json(201, users.add(body.username, body.password));
  } catch (error) {
    return json(400, { error: error.message });
  }
}

export function json(status, body, headers = {}) {
  return {
    status,
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  };
}
