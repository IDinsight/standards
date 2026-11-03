export function createStore(seed = []) {
  const contacts = new Map();
  let nextId = 1;

  function add({ name, email }) {
    if (!name || !email) throw new Error('name and email are required');
    const contact = { id: nextId++, name: name.trim(), email: email.trim().toLowerCase() };
    contacts.set(contact.id, contact);
    return contact;
  }

  for (const entry of seed) add(entry);

  return {
    add,
    get: (id) => contacts.get(id) ?? null,
    list: () => [...contacts.values()],
  };
}
