export function createRatesClient({ baseUrl, token, timeoutMs }, fetchImpl = globalThis.fetch) {
  return {
    async latest(symbols) {
      const url = `${baseUrl}/rates/latest?symbols=${encodeURIComponent(symbols.join(','))}`;
      const response = await fetchImpl(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new Error(`rates request failed with ${response.status}`);
      return response.json();
    },
  };
}
