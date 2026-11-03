export class TimeoutError extends Error {
  constructor(timeoutMs) {
    super(`job exceeded ${timeoutMs} ms`);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

// A controller that aborts when `parent` aborts or when `timeoutMs` elapses,
// whichever comes first. Call dispose() once the work it guards has settled.
export function linkedController(parent, timeoutMs) {
  const controller = new AbortController();
  const cleanups = [];
  if (parent?.aborted) {
    controller.abort(parent.reason);
  } else if (parent) {
    const onAbort = () => controller.abort(parent.reason);
    parent.addEventListener('abort', onAbort, { once: true });
    cleanups.push(() => parent.removeEventListener('abort', onAbort));
  }
  if (timeoutMs != null && !controller.signal.aborted) {
    const timer = setTimeout(() => controller.abort(new TimeoutError(timeoutMs)), timeoutMs);
    cleanups.push(() => clearTimeout(timer));
  }
  return {
    signal: controller.signal,
    dispose() {
      for (const cleanup of cleanups.splice(0)) cleanup();
    },
  };
}

// Settle with `promise`, or reject with the signal's reason as soon as it
// aborts. The underlying work is not stopped; that is up to the job.
export function raceAbort(promise, signal) {
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}
