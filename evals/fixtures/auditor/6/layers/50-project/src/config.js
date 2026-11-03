export function loadConfig(env = process.env) {
  const secret = env.REPORTDESK_SECRET;
  if (!secret) throw new Error('REPORTDESK_SECRET is not set');
  return { secret };
}
