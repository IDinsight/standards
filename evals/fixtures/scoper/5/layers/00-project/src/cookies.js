const MAX_AGE_SECONDS = 12 * 60 * 60;

export function sessionCookie(id, { secure = true } = {}) {
  const parts = ['sid=' + encodeURIComponent(id), 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=' + MAX_AGE_SECONDS];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function parseCookies(header = '') {
  const cookies = {};
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    cookies[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return cookies;
}
