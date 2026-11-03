export function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT ?? 8080),
    sessionSecret: env.SESSION_SECRET ?? 'dev-only-secret',
    sessionTtlSeconds: Number(env.SESSION_TTL_SECONDS ?? 14 * 24 * 3600),
    cookieDomain: env.COOKIE_DOMAIN || undefined,
    secureCookies: env.SECURE_COOKIES !== 'false',
    sessionFile: env.SESSION_FILE ?? 'var/sessions.json',
    usersFile: env.USERS_FILE ?? 'var/users.json',
    auditFile: env.AUDIT_FILE ?? 'var/audit.log',
    webOrigin: env.WEB_ORIGIN ?? 'http://localhost:5173',
  };
}
