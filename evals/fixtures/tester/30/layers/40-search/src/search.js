function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function matches(contact, query) {
  const needle = normalize(query);
  if (!needle) return false;
  return normalize(contact.name).includes(needle) || normalize(contact.email).includes(needle);
}

export function search(contacts, query) {
  if (!normalize(query)) return [];
  return contacts
    .filter((contact) => matches(contact, query))
    .sort((a, b) => a.name.localeCompare(b.name));
}
