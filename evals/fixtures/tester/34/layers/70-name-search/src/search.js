// Contact search over a directory created by createDirectory().
export function searchContacts(directory, query) {
  const needle = query.trim().toLowerCase();
  if (needle === '') return [];
  return directory.list().filter((contact) => contact.name.toLowerCase().includes(needle));
}
