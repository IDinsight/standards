const SEED = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.org', phone: '+44 20 7946 0101' },
  { id: 2, name: 'Grace Hopper', email: 'grace.hopper@example.com', phone: '+1 202 555 0143' },
  { id: 3, name: 'Alan Turing', email: 'alan@example.org', phone: '+44 20 7946 0177' },
  { id: 4, name: 'Katherine Johnson', email: 'kjohnson@example.net', phone: '+1 757 555 0188' },
];

export function createStore(initial = SEED) {
  const contacts = initial.map((contact) => ({ ...contact }));
  let nextId = Math.max(0, ...contacts.map((contact) => contact.id)) + 1;

  return {
    list() {
      return contacts.map((contact) => ({ ...contact }));
    },
    get(id) {
      const found = contacts.find((contact) => contact.id === id);
      return found ? { ...found } : null;
    },
    add({ name, email, phone = '' }) {
      const contact = { id: nextId, name, email, phone };
      nextId += 1;
      contacts.push(contact);
      return { ...contact };
    },
  };
}
