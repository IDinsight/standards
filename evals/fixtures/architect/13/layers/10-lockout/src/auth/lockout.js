export const MAX_FAILURES = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;

export class LockoutTracker {
  constructor(now = () => Date.now()) {
    this.now = now;
    this.entries = new Map();
  }

  lockedForMs(email) {
    const entry = this.entries.get(email);
    if (!entry?.lockedUntil) return 0;
    const remaining = entry.lockedUntil - this.now();
    if (remaining > 0) return remaining;
    this.entries.delete(email);
    return 0;
  }

  recordFailure(email) {
    const entry = this.entries.get(email) ?? { failures: 0, lockedUntil: 0 };
    entry.failures += 1;
    if (entry.failures >= MAX_FAILURES) entry.lockedUntil = this.now() + LOCKOUT_MS;
    this.entries.set(email, entry);
  }

  recordSuccess(email) {
    this.entries.delete(email);
  }
}
