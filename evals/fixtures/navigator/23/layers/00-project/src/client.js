import { withRetry } from './retry.js';

export function createClient({ baseUrl, fetchImpl = globalThis.fetch }) {
  async function request(path) {
    let response;
    try {
      response = await fetchImpl(new URL(path, baseUrl));
    } catch (cause) {
      const error = new Error(`GET ${path} could not connect`, { cause });
      error.retryable = true;
      throw error;
    }
    if (!response.ok) {
      const error = new Error(`GET ${path} failed with ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  return {
    getJson: (path) => withRetry(() => request(path)),
  };
}
