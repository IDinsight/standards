# notes

In-memory note storage used by the notes service.

- `createStore(initial)` in `src/store.js` keeps notes in memory.
- `addNote(store, { title, body, tags })` in `src/notes.js` creates a note;
  titles are trimmed and tags are trimmed and lowercased.
- `listNotes(store, { includeArchived })` returns notes newest first and hides
  archived notes unless asked.

Run the tests with `npm test`.
