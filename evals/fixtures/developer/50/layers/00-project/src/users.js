import { hashPassword } from './passwords.js';

const MIN_PASSWORD_LENGTH = 8;

function normalize(username) {
  return typeof username === 'string' ? username.trim().toLowerCase() : '';
}

export function createUserStore() {
  const byName = new Map();
  let nextId = 1;
  return {
    add(username, password) {
      const name = normalize(username);
      if (!name) throw new Error('username is required');
      if (byName.has(name)) throw new Error('username is taken');
      if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      }
      const user = { id: nextId++, username: name, passwordHash: hashPassword(password) };
      byName.set(name, user);
      return { id: user.id, username: user.username };
    },
    findByUsername(username) {
      return byName.get(normalize(username)) ?? null;
    },
    findById(id) {
      for (const user of byName.values()) if (user.id === id) return user;
      return null;
    },
  };
}
