export class LoginLimiter {
  constructor({ limit = 5, windowMs = 15 * 60 * 1000, now = () => Date.now() } = {}) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
    this.failures = new Map();
  }

  recent(username) {
    const cutoff = this.now() - this.windowMs;
    return (this.failures.get(username) ?? []).filter((time) => time > cutoff);
  }

  blocked(username) {
    return this.recent(username).length >= this.limit;
  }

  recordFailure(username) {
    const recent = this.recent(username);
    recent.push(this.now());
    this.failures.set(username, recent);
  }

  reset(username) {
    this.failures.delete(username);
  }
}
