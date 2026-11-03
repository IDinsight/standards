export function resolve(store, code, now = new Date()) {
  const link = store.get(code.toLowerCase());
  if (!link) return { status: 404, location: null };
  if (link.expiresAt && new Date(link.expiresAt) <= now) return { status: 410, location: null };
  store.recordHit(link.code);
  return { status: 302, location: link.url };
}
