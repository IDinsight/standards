export function listNotes(store, { includeArchived = false } = {}) {
  return store
    .all()
    .filter((note) => includeArchived || !note.archived)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function addNote(store, { title, body = '', tags = [] }) {
  if (!title || !title.trim()) throw new Error('title is required');
  return store.add({
    id: store.all().length + 1,
    title: title.trim(),
    body,
    tags: tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean),
    archived: false,
    updatedAt: new Date().toISOString(),
  });
}
