// A token bucket: holds up to `capacity` tokens and refills continuously at
// `refillPerSecond`. Each request spends tokens; when there are not enough,
// the request is refused.
export class TokenBucket {
  constructor({ capacity, refillPerSecond, now = () => Date.now() }) {
    if (!(capacity > 0)) throw new RangeError('capacity must be positive');
    if (!(refillPerSecond > 0)) throw new RangeError('refillPerSecond must be positive');
    this.capacity = capacity;
    this.refillPerSecond = refillPerSecond;
    this.now = now;
    this.tokens = capacity;
    this.updatedAt = now();
  }

  refill() {
    const t = this.now();
    const elapsed = (t - this.updatedAt) / 1000;
    if (elapsed > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillPerSecond);
      this.updatedAt = t;
    }
  }

  take(cost = 1) {
    this.refill();
    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    return false;
  }

  // Milliseconds until `cost` tokens are available again.
  retryAfterMs(cost = 1) {
    this.refill();
    const missing = cost - this.tokens;
    if (missing <= 0) return 0;
    return Math.ceil((missing / this.refillPerSecond) * 1000);
  }
}
