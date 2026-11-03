export class TimeoutError extends Error {
  constructor(message = 'operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Reject with TimeoutError if `promise` has not settled within `ms`.
// `onTimeout` runs first so the caller can cancel the pending work.
export function withTimeout(promise, ms, onTimeout) {
  let timer;
  const expired = new Promise((_, reject) => {
    timer = setTimeout(() => {
      onTimeout?.();
      reject(new TimeoutError());
    }, ms);
  });
  return Promise.race([promise, expired]).finally(() => clearTimeout(timer));
}
