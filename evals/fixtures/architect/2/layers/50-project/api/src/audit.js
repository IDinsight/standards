import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export class AuditLog {
  constructor({ now = () => Date.now(), file = null } = {}) {
    this.now = now;
    this.file = file;
    this.entries = [];
  }

  record(event, userId, detail = {}) {
    const entry = { at: new Date(this.now()).toISOString(), event, userId, ...detail };
    this.entries.push(entry);
    if (this.file) {
      mkdirSync(dirname(this.file), { recursive: true });
      appendFileSync(this.file, `${JSON.stringify(entry)}\n`);
    }
  }
}
