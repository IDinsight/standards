export function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT ?? 8080),
    webhookUrl: env.WEBHOOK_URL ?? 'http://localhost:9000/hooks',
  };
}
