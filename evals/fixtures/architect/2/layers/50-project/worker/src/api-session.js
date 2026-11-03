// Server-side API access for the worker: signs in with the service account,
// keeps the session cookie and CSRF token, and signs in again once if the
// session has expired.
export function createWorkerSession({ baseUrl, username, password, fetch = globalThis.fetch }) {
  let cookie = null;
  let csrfToken = null;

  async function login() {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error(`worker login failed: HTTP ${response.status}`);
    cookie = (response.headers.get('set-cookie') ?? '').split(';')[0];
    csrfToken = (await response.json()).csrfToken;
  }

  async function send(method, path, body, retried = false) {
    if (!cookie) await login();
    const headers = { cookie, accept: 'application/json' };
    if (body !== undefined) headers['content-type'] = 'application/json';
    if (method !== 'GET') headers['x-csrf-token'] = csrfToken;
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 401 && !retried) {
      cookie = null;
      return send(method, path, body, true);
    }
    if (!response.ok) throw new Error(`${method} ${path} failed: HTTP ${response.status}`);
    return response.status === 204 ? null : response.json();
  }

  return {
    get: (path) => send('GET', path),
    post: (path, body) => send('POST', path, body),
  };
}
