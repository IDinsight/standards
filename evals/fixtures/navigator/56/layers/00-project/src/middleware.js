import { TokenBucket } from './limiter.js';

export function createLimiter({ capacity = 10, refillPerInterval = 10, intervalMs = 1000, now = Date.now } = {}) {
  const buckets = new Map();
  return function limit(clientId) {
    let bucket = buckets.get(clientId);
    if (!bucket) {
      bucket = new TokenBucket({ capacity, refillPerInterval, intervalMs, now });
      buckets.set(clientId, bucket);
    }
    if (bucket.tryTake()) return { status: 200 };
    return { status: 429, retryAfterMs: bucket.lastRefill + intervalMs - now() };
  };
}
