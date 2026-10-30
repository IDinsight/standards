export function searchContacts(contacts, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return contacts.filter((contact) => contact.name.toLowerCase().includes(needle)
    || contact.email.toLowerCase().includes(needle));
}
