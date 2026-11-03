import { createHash, randomBytes } from 'node:crypto';

const PREFIX = 'dk_';

export function hashKey(key) {
  return createHash('sha256').update(key).digest('hex');
}

function generateKey() {
  return PREFIX + randomBytes(24).toString('hex');
}

// API keys are never stored in plain form; only their SHA-256 hashes are kept.
export class CredentialStore {
  constructor() {
    this.byHash = new Map(); // key hash -> { accountId, createdAt }
    this.byAccount = new Map(); // accountId -> key hash
  }

  issue(accountId, now = new Date()) {
    if (this.byAccount.has(accountId)) {
      throw new Error(`account ${accountId} already has a key`);
    }
    return this.#store(accountId, now);
  }

  rotate(accountId, now = new Date()) {
    const current = this.byAccount.get(accountId);
    if (!current) throw new Error(`account ${accountId} has no key`);
    this.byHash.delete(current);
    return this.#store(accountId, now);
  }

  lookup(key) {
    if (typeof key !== 'string' || !key.startsWith(PREFIX)) return null;
    return this.byHash.get(hashKey(key)) ?? null;
  }

  #store(accountId, now) {
    const key = generateKey();
    const hash = hashKey(key);
    this.byHash.set(hash, { accountId, createdAt: now.toISOString() });
    this.byAccount.set(accountId, hash);
    return key;
  }
}
