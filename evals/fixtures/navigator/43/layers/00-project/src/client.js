export function createClient({ serverUrl, fetchImpl = globalThis.fetch }) {
  return {
    async postObservation(observation) {
      const response = await fetchImpl(serverUrl + '/api/observations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(observation),
      });
      if (response.status !== 201) throw new Error('server returned ' + response.status);
      return response.json();
    },
  };
}
