export class CircuitOpenError extends Error {
  constructor(message = 'circuit open') {
    super(message);
    this.name = 'CircuitOpenError';
  }
}

// Counts consecutive failures of the wrapped call. After `threshold` failures
// in a row, calls are rejected without running for `cooldownMs`.
export function createBreaker({ threshold, cooldownMs, now = Date.now }) {
  let failures = 0;
  let openedAt = null;

  return {
    async run(fn) {
      if (openedAt !== null) {
        if (now() - openedAt < cooldownMs) throw new CircuitOpenError();
        openedAt = null;
        failures = 0;
      }
      try {
        const result = await fn();
        failures = 0;
        return result;
      } catch (error) {
        failures += 1;
        if (failures >= threshold) openedAt = now();
        throw error;
      }
    },
    state() {
      return openedAt === null ? 'closed' : 'open';
    },
  };
}
