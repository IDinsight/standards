// In-memory contact directory. Records are { id, name, email }.
export function createDirectory(records) {
  const byId = new Map();
  for (const record of records) {
    if (byId.has(record.id)) throw new Error(`duplicate contact id ${record.id}`);
    byId.set(record.id, { id: record.id, name: record.name, email: record.email.toLowerCase() });
  }
  return {
    get: (id) => byId.get(id) ?? null,
    list: () => [...byId.values()],
    size: () => byId.size,
  };
}
