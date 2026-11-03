export const DEFAULT_TTL_MS = 60 * 1000;

export class InvoiceCache {
  constructor({ ttlMs = DEFAULT_TTL_MS, now = () => Date.now() } = {}) {
    this.ttlMs = ttlMs;
    this.now = now;
    this.entries = new Map();
  }

  get(id) {
    const entry = this.entries.get(id);
    if (!entry) return undefined;
    if (this.now() - entry.storedAt >= this.ttlMs) {
      this.entries.delete(id);
      return undefined;
    }
    return entry.value;
  }

  set(id, value) {
    this.entries.set(id, { value, storedAt: this.now() });
  }

  invalidate(id) {
    this.entries.delete(id);
  }

  clear() {
    this.entries.clear();
  }
}
