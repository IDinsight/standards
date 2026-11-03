export function loadConfig(env = process.env) {
  return {
    endpoint: env.WEBHOOK_ENDPOINT ?? 'http://localhost:8080/hooks',
    backoffMs: Number(env.WEBHOOK_BACKOFF_MS ?? 500),
  };
}
