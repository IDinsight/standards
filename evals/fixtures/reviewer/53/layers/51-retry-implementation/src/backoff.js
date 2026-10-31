// Delay before the retry that follows `attempt` (1-based): the base delay,
// doubled for each later attempt, never more than the maximum.
export function backoffDelay(attempt, { baseDelayMs, maxDelayMs }) {
  return Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
}
