const REQUIRED = ['id', 'name', 'email'];

export function createRecord(input, now = new Date()) {
  for (const key of REQUIRED) {
    if (typeof input[key] !== 'string' || input[key].trim() === '') {
      throw new TypeError(`${key} is required`);
    }
  }
  return {
    id: input.id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role ?? 'admin',
    createdAt: now.toISOString(),
  };
}

export function updateRecord(record, changes) {
  const next = { ...record };
  if (changes.name !== undefined) next.name = String(changes.name).trim();
  if (changes.email !== undefined) next.email = String(changes.email).trim().toLowerCase();
  if (changes.role !== undefined) next.role = changes.role;
  return next;
}

export function toResponse(record) {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    createdAt: record.createdAt,
  };
}
