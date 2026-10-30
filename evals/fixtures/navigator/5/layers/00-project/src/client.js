import { retry } from './retry.js';

export function createClient({ transport, retry: retryOptions = {} }) {
  return {
    request(method, path, body, { signal } = {}) {
      return retry(() => transport(method, path, body), { ...retryOptions, signal });
    },
  };
}
