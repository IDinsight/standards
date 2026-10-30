export function createAuditLog(entries = []) {
  const items = entries.map((entry) => ({ ...entry }));
  return {
    append(entry) {
      items.push({ ...entry });
    },
    all() {
      return items.slice();
    },
  };
}

export function parseFilters(query = {}) {
  return {
    actor: query.actor || null,
    action: query.action || null,
    from: query.from ? new Date(query.from) : null,
    to: query.to ? new Date(query.to) : null,
  };
}

export function filterEntries(entries, filters) {
  return entries.filter((entry) => {
    if (filters.actor && entry.actor !== filters.actor) return false;
    if (filters.action && entry.action !== filters.action) return false;
    const at = new Date(entry.timestamp);
    if (filters.from && at < filters.from) return false;
    if (filters.to && at > filters.to) return false;
    return true;
  });
}
