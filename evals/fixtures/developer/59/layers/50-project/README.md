# tagbox

Tag parsing and a small in-memory tag store for notes and bookmarks.

- `src/tags.js`: `normalizeTag(name)` and `parseTags(input)` for comma-separated tag input.
- `src/store.js`: `TagStore`, which keeps the normalized tags for each item.

Run the tests with `npm test` (Node 22, no dependencies).
