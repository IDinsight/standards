export function formatBookmark(bookmark) {
  const tags = bookmark.tags.length ? ' [' + bookmark.tags.join(', ') + ']' : '';
  return bookmark.id + '. ' + bookmark.title + ' <' + bookmark.url + '>' + tags;
}

export function formatList(bookmarks) {
  return bookmarks.length ? bookmarks.map(formatBookmark).join('\n') : '(no bookmarks)';
}
