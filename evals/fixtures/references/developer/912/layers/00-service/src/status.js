export function statusPayload({ version, startedAt, now = Date.now() }) {
  return {
    status: 'ok',
    version,
    uptimeSeconds: Math.max(0, Math.floor((now - startedAt) / 1000)),
  };
}
