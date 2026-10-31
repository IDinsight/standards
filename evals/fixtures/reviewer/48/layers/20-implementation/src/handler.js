export function handleLookup(req, { directory, limiter } = {}) {
  if (limiter) {
    const decision = limiter.check(req.clientId);
    if (!decision.allowed) {
      return {
        status: 429,
        headers: { 'Retry-After': String(decision.retryAfterSeconds) },
        body: { error: 'too many requests' },
      };
    }
  }
  const code = req.query?.code;
  if (!code) return { status: 400, headers: {}, body: { error: 'code is required' } };
  const office = directory.find(code);
  if (!office) return { status: 404, headers: {}, body: { error: 'office not found' } };
  return { status: 200, headers: {}, body: office };
}
