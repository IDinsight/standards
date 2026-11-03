export function loadConfig(env = process.env) {
  for (const name of ['RECORDS_API_URL', 'MAILER_URL']) {
    if (!env[name]) throw new Error(`${name} is not set`);
  }
  return {
    port: Number(env.PORT ?? 8080),
    recordsApiUrl: env.RECORDS_API_URL,
    mailerUrl: env.MAILER_URL,
  };
}
