const DEFAULT_TTL_SECONDS = 300;
const DEFAULT_MAX_ENTRIES = 500;

export class RateCache {
  constructor({ ttlSeconds = DEFAULT_TTL_SECONDS, maxEntries = DEFAULT_MAX_ENTRIES, now = Date.now } = {}) {
    this.ttlMs = ttlSeconds * 1000;
    this.maxEntries = maxEntries;
    this.now = now;
    this.entries = new Map();
  }

  get(key) {
    const entry = this.entries.get(key);
    return entry ? entry.value : undefined;
  }

  set(key, value) {
    this.entries.set(key, { value, storedAt: this.now() });
    if (this.entries.size > this.maxEntries) this.prune();
  }

  prune() {
    const cutoff = this.now() - this.ttlMs;
    for (const [key, entry] of this.entries) {
      if (entry.storedAt <= cutoff) this.entries.delete(key);
    }
    // Still over the limit: drop the oldest entries first.
    while (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      this.entries.delete(oldest);
    }
  }

  clear() {
    this.entries.clear();
  }

  get size() {
    return this.entries.size;
  }
}
