# notes

In-memory note storage with simple tag lookup.

- `createStore()` returns an empty store.
- `saveNote(store, note)` saves a copy of `{ id, title, body, tags }`.
- `notesWithTag(store, tag)` lists notes carrying a tag.

Run the tests with `npm test`.
