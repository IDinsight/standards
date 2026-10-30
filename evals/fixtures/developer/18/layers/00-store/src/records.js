const ROLES = new Set(['owner', 'admin', 'support']);

export class ValidationError extends Error {}

export class AdminRecordStore {
  #records = new Map();
  #nextId = 1;

  create({ name, email, role = 'support' }) {
    const record = normalize({ name, email, role });
    record.id = this.#nextId++;
    this.#records.set(record.id, record);
    return { ...record };
  }

  get(id) {
    const record = this.#records.get(id);
    return record ? { ...record } : null;
  }

  update(id, changes) {
    const current = this.#records.get(id);
    if (!current) return null;
    const next = { ...normalize({ ...current, ...pick(changes) }), id };
    this.#records.set(id, next);
    return { ...next };
  }

  list() {
    return [...this.#records.values()].map((record) => ({ ...record }));
  }
}

function pick(changes) {
  const allowed = {};
  for (const key of ['name', 'email', 'role']) {
    if (key in changes) allowed[key] = changes[key];
  }
  return allowed;
}

export function normalize({ name, email, role }) {
  if (typeof name !== 'string' || !name.trim()) throw new ValidationError('name is required');
  if (typeof email !== 'string' || !email.includes('@')) throw new ValidationError('email is invalid');
  if (!ROLES.has(role)) throw new ValidationError('unknown role: ' + role);
  return { name: name.trim(), email: email.trim().toLowerCase(), role };
}
