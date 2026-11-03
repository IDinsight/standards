// In-memory note storage.

export function createStore() {
  return { notes: [], nextId: 1 };
}

export function createNote(store, { title, body = '' } = {}) {
  const cleanTitle = String(title ?? '').trim();
  if (cleanTitle === '') {
    throw new Error('title is required');
  }
  const note = { id: store.nextId, title: cleanTitle, body: String(body) };
  store.nextId += 1;
  store.notes.push(note);
  return { ...note };
}

export function listNotes(store) {
  return store.notes.map((note) => ({ ...note }));
}

export function deleteNote(store, id) {
  const index = store.notes.findIndex((note) => note.id === id);
  if (index === -1) {
    return false;
  }
  store.notes.splice(index, 1);
  return true;
}
