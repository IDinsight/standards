import { TokenBucket } from './limiter.js';

export function rateLimit({ capacity, refillPerSecond, now = () => Date.now() }) {
  const buckets = new Map();

  return function limit(req, res, next) {
    const key = req.socket.remoteAddress;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = new TokenBucket({ capacity, refillPerSecond, now });
      buckets.set(key, bucket);
    }
    if (bucket.tryTake()) {
      next();
      return;
    }
    const missing = 1 - bucket.tokens;
    const retryAfter = Math.max(1, Math.ceil(missing / refillPerSecond));
    res.statusCode = 429;
    res.setHeader('Retry-After', String(retryAfter));
    res.end('Too Many Requests');
  };
}
