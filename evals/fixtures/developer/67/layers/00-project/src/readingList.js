// In-memory reading list. Entries keep their tags exactly as they were added.
export function createReadingList() {
  const books = [];

  return {
    add(book) {
      if (!book || typeof book.title !== 'string' || book.title.trim() === '') {
        throw new TypeError('title is required');
      }
      const entry = {
        title: book.title.trim(),
        author: typeof book.author === 'string' ? book.author.trim() : '',
        tags: Array.isArray(book.tags) ? [...book.tags] : [],
      };
      books.push(entry);
      return { ...entry, tags: [...entry.tags] };
    },

    list() {
      return books.map((entry) => ({ ...entry, tags: [...entry.tags] }));
    },
  };
}
