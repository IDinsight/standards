// Wrap a node:http request handler so each client is rate limited. The client
// key defaults to the X-Client-Id header, then the remote address.
export function withRateLimit(limiter, handler, {
  keyOf = (req) => req.headers['x-client-id'] ?? req.socket?.remoteAddress ?? 'anonymous',
} = {}) {
  return (req, res) => {
    const { allowed, retryAfterMs } = limiter.check(keyOf(req));
    if (!allowed) {
      res.statusCode = 429;
      res.setHeader('Retry-After', String(Math.ceil(retryAfterMs / 1000)));
      res.end('Too Many Requests');
      return undefined;
    }
    return handler(req, res);
  };
}
