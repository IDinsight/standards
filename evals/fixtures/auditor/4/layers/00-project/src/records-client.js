// Thin client for records-api, which owns appointment data.
export function createRecordsClient(baseUrl, fetchImpl = fetch) {
  async function call(method, path, body) {
    const response = await fetchImpl(new URL(path, baseUrl), {
      method,
      headers: body ? { 'content-type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`records-api ${method} ${path} failed with ${response.status}`);
    return response.status === 204 ? null : response.json();
  }

  return {
    listAppointments: () => call('GET', '/appointments'),
    getAppointment: (id) => call('GET', `/appointments/${encodeURIComponent(id)}`),
    createAppointment: (appointment) => call('POST', '/appointments', appointment),
    updateAppointment: (id, changes) => call('PATCH', `/appointments/${encodeURIComponent(id)}`, changes),
  };
}
