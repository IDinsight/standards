import { withRetry } from './retry.js';

export async function fetchOrder(id, { request, wait } = {}) {
  return withRetry(() => request(`/orders/${encodeURIComponent(id)}`), { wait });
}
