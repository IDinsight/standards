import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export class MemorySessionBackend {
  constructor() {
    this.records = new Map();
  }

  load() {
    return this.records;
  }

  save(records) {
    this.records = records;
  }
}

export class FileSessionBackend {
  constructor(file) {
    this.file = file;
  }

  load() {
    if (!existsSync(this.file)) return new Map();
    return new Map(Object.entries(JSON.parse(readFileSync(this.file, 'utf8'))));
  }

  save(records) {
    mkdirSync(dirname(this.file), { recursive: true });
    writeFileSync(this.file, JSON.stringify(Object.fromEntries(records)));
  }
}

// Server-side sessions with a sliding expiry: every authenticated request
// pushes expiresAt forward by the TTL.
export class SessionStore {
  constructor({ backend = new MemorySessionBackend(), ttlSeconds, now = () => Date.now() }) {
    this.backend = backend;
    this.ttlMs = ttlSeconds * 1000;
    this.now = now;
    this.records = backend.load();
  }

  create(user) {
    const id = randomBytes(24).toString('base64url');
    const record = {
      userId: user.id,
      role: user.role,
      csrfToken: randomBytes(16).toString('base64url'),
      createdAt: this.now(),
      expiresAt: this.now() + this.ttlMs,
    };
    this.records.set(id, record);
    this.backend.save(this.records);
    return { id, ...record };
  }

  get(id) {
    const record = this.records.get(id);
    if (!record) return null;
    if (record.expiresAt <= this.now()) {
      this.destroy(id);
      return null;
    }
    return { id, ...record };
  }

  touch(id) {
    const record = this.records.get(id);
    if (!record) return;
    record.expiresAt = this.now() + this.ttlMs;
    this.backend.save(this.records);
  }

  destroy(id) {
    if (this.records.delete(id)) this.backend.save(this.records);
  }

  destroyForUser(userId) {
    let changed = false;
    for (const [id, record] of this.records) {
      if (record.userId === userId) {
        this.records.delete(id);
        changed = true;
      }
    }
    if (changed) this.backend.save(this.records);
  }
}
