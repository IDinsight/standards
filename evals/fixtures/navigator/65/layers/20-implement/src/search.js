const MAX_RESULTS = 20;

function normalize(text) {
  return String(text ?? '').trim().toLowerCase();
}

export function searchBooks(books, query) {
  const term = normalize(query);
  if (!term) return [];
  return books
    .filter((book) => normalize(book.title).includes(term) || normalize(book.author).includes(term))
    .sort((left, right) => left.title.localeCompare(right.title))
    .slice(0, MAX_RESULTS);
}
