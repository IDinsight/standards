export class Sessions {
  constructor() {
    this.tokens = new Map();
  }

  issue(userId, token) {
    this.tokens.set(token, userId);
    return token;
  }

  userFor(token) {
    if (!token) return null;
    return this.tokens.get(token) ?? null;
  }
}

export function bearerToken(headers = {}) {
  const value = headers.authorization ?? '';
  return value.startsWith('Bearer ') ? value.slice('Bearer '.length) : null;
}
