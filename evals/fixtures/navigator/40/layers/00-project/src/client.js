import { withRetry } from './retry.js';

export async function getJson(url, { retries = 3, baseDelayMs = 100 } = {}) {
  return withRetry(async () => {
    const response = await fetch(url, { headers: { accept: 'application/json' } });
    if (!response.ok) {
      const error = new Error(`GET ${url} failed with ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }, { retries, baseDelayMs });
}
