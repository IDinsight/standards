import { TokenBucket } from './bucket.js';

// Keeps one token bucket per client key. Keys are kept in insertion order, so
// when `maxKeys` is reached the oldest key's bucket is dropped.
export class RateLimiter {
  constructor({ capacity = 10, refillPerSecond = 1, now = () => Date.now(), maxKeys = 10000 } = {}) {
    this.options = { capacity, refillPerSecond, now };
    this.maxKeys = maxKeys;
    this.buckets = new Map();
  }

  bucketFor(key) {
    let bucket = this.buckets.get(key);
    if (!bucket) {
      if (this.buckets.size >= this.maxKeys) {
        const oldest = this.buckets.keys().next().value;
        this.buckets.delete(oldest);
      }
      bucket = new TokenBucket(this.options);
      this.buckets.set(key, bucket);
    }
    return bucket;
  }

  check(key, cost = 1) {
    const bucket = this.bucketFor(key);
    if (bucket.take(cost)) return { allowed: true, retryAfterMs: 0 };
    return { allowed: false, retryAfterMs: bucket.retryAfterMs(cost) };
  }
}
