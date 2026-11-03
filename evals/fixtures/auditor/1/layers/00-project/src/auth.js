// API_KEYS holds comma-separated `key:userId:role` entries; role is admin or member.
export function parseKeys(text = '') {
  const keys = new Map();
  for (const entry of text.split(',').map((part) => part.trim()).filter(Boolean)) {
    const [key, userId, role] = entry.split(':');
    if (!key || !userId || !['admin', 'member'].includes(role)) {
      throw new Error(`Invalid API_KEYS entry for user ${userId || '?'}`);
    }
    keys.set(key, { userId, role });
  }
  return keys;
}

export function authenticate(headers, keys) {
  const key = headers['x-api-key'];
  return (typeof key === 'string' && keys.get(key)) || null;
}

// Which owner's records a request may see: admins choose (or see all), members see their own.
export function ownerScope(user, requestedOwner) {
  if (user.role === 'admin') return requestedOwner ?? null;
  return user.userId;
}
