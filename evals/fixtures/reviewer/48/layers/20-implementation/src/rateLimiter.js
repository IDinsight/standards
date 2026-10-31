export const DEFAULT_LIMIT = 60;
export const DEFAULT_WINDOW_MS = 60_000;

export function createRateLimiter({ limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS, now = Date.now } = {}) {
  const windows = new Map();
  return {
    check(clientId) {
      const key = String(clientId ?? 'anonymous');
      const time = now();
      let window = windows.get(key);
      if (!window || time >= window.start + windowMs) {
        window = { start: time, count: 0 };
        windows.set(key, window);
      }
      window.count += 1;
      if (window.count <= limit) {
        return { allowed: true, remaining: limit - window.count, retryAfterSeconds: 0 };
      }
      const retryAfterSeconds = Math.max(1, Math.ceil((window.start + windowMs - time) / 1000));
      return { allowed: false, remaining: 0, retryAfterSeconds };
    },
  };
}
