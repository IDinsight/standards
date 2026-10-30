// Browser client for the TallyHub API. The session lives in the HttpOnly
// cookie, so every request is sent with credentials; writes also carry the
// CSRF token returned by /login or /me.
export function createApiClient({ baseUrl, fetch = globalThis.fetch, onUnauthorized = () => {} }) {
  let csrfToken = null;

  async function request(method, path, body) {
    const headers = { accept: 'application/json' };
    if (body !== undefined) headers['content-type'] = 'application/json';
    if (method !== 'GET' && csrfToken) headers['x-csrf-token'] = csrfToken;
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 401 && path !== '/login') {
      csrfToken = null;
      onUnauthorized();
    }
    const data = response.status === 204 ? null : await response.json();
    if (!response.ok) {
      throw Object.assign(new Error(data?.error ?? `HTTP ${response.status}`), { status: response.status });
    }
    return data;
  }

  return {
    async login(username, password) {
      const data = await request('POST', '/login', { username, password });
      csrfToken = data.csrfToken;
      return data.user;
    },
    async restore() {
      const data = await request('GET', '/me');
      csrfToken = data.csrfToken;
      return data;
    },
    async logout() {
      await request('POST', '/logout');
      csrfToken = null;
    },
    listExpenses: () => request('GET', '/expenses'),
    addExpense: (expense) => request('POST', '/expenses', expense),
  };
}
