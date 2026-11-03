# book-catalog

In-memory catalog of books used by the library kiosk.

- `src/catalog.js` holds the book list and lookup helpers.
- `src/search.js` exports `searchBooks(books, query)`, which matches part of a
  title or author name.

Run the tests with `npm test` (Node 22, no dependencies).
