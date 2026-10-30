const normalize = (tag) => tag.trim().toLowerCase();

export function filterByTag(bookmarks, tag) {
  const wanted = normalize(tag);
  return bookmarks.filter((bookmark) => bookmark.tags.includes(wanted));
}
