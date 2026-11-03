export function createApiClient({ baseUrl, fetchImpl = fetch }) {
  return {
    async login(email, password) {
      const response = await fetchImpl(`${baseUrl}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.status !== 204) throw new Error(`login failed: ${response.status}`);
    },

    async me() {
      const response = await fetchImpl(`${baseUrl}/me`, { credentials: 'include' });
      if (response.status === 401) return null;
      return response.json();
    },
  };
}
