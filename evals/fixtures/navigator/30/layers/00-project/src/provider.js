import { withTimeout } from './timeout.js';

export class ProviderError extends Error {
  constructor(status) {
    super(`provider responded ${status}`);
    this.name = 'ProviderError';
    this.status = status;
  }
}

export function createProvider({ baseUrl, pool, requestTimeoutMs, fetchImpl = fetch }) {
  async function get(path) {
    await pool.acquire();
    const controller = new AbortController();
    try {
      return await withTimeout(
        (async () => {
          const response = await fetchImpl(new URL(path, baseUrl), { signal: controller.signal });
          if (!response.ok) throw new ProviderError(response.status);
          return response.json();
        })(),
        requestTimeoutMs,
        () => controller.abort(),
      );
    } finally {
      pool.release();
    }
  }

  return {
    rates: (sku) => get(`/v2/rates/${encodeURIComponent(sku)}`),
    fees: (region) => get(`/v2/fees/${encodeURIComponent(region)}`),
  };
}
