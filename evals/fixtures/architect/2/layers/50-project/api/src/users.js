import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 32).toString('hex')}`;
}

function matches(password, stored) {
  const [salt, hash] = stored.split(':');
  const candidate = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// Roles: `member` (own expenses), `admin` (everything), `service` (report worker).
export class UserDirectory {
  constructor(users = []) {
    this.byName = new Map(users.map((user) => [user.username, user]));
  }

  verify(username, password) {
    const user = this.byName.get(username);
    if (!user || user.disabled || !matches(password, user.passwordHash)) return null;
    return { id: user.id, username: user.username, role: user.role };
  }
}
