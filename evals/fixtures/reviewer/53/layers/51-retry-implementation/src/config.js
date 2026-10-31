// Default retry settings for webhook delivery. Callers may override any of them.
export const retryDefaults = Object.freeze({
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 8000,
});
