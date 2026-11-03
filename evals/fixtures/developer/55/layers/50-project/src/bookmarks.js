export function createStore() {
  return { nextId: 1, items: [] };
}

export function addBookmark(store, { url, title, tags = [] }) {
  if (!url) throw new Error('url is required');
  const bookmark = {
    id: store.nextId++,
    url,
    title: title?.trim() || url,
    tags: tags.map((tag) => tag.trim()).filter(Boolean),
  };
  store.items.push(bookmark);
  return bookmark;
}

export function listBookmarks(store) {
  return [...store.items];
}
