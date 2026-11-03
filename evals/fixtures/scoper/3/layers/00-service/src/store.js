export class MemoryStore {
  constructor() {
    this.tokens = new Map();
  }

  saveToken(token) {
    this.tokens.set(token.value, token);
  }

  getToken(value) {
    return this.tokens.get(value) ?? null;
  }

  deleteToken(value) {
    return this.tokens.delete(value);
  }

  allTokens() {
    return [...this.tokens.values()];
  }
}
