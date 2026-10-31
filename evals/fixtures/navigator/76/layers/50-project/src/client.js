import { withRetry } from './retry.js';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function isRetryable(error) {
  if (error instanceof HttpError) return error.status === 429 || error.status >= 500;
  return error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT';
}

export async function fetchJson(transport, url, options = {}) {
  return withRetry(async () => {
    const response = await transport(url);
    if (response.status >= 400) throw new HttpError(response.status, `GET ${url} failed with ${response.status}`);
    return response.body;
  }, { ...options, shouldRetry: isRetryable });
}
