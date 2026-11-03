# taglist

Tag notes and filter them by tag. No dependencies.

## Requirements

Node.js 22 or later.

## API

- `normalizeTag(tag)` — trims and lowercases a tag.
- `union(a, b)`, `intersection(a, b)`, `difference(a, b)` — return a new `Set`; the arguments are not changed.
- `createNote(id, text, tags)` — returns a note whose tags are normalized.
- `notesWithAnyTag(notes, tags)` — the notes that carry at least one of `tags`, in input order.
- `notesWithAllTags(notes, tags)` — the notes that carry every one of `tags`, in input order. Tags are normalized before comparing; an empty `tags` list returns every note.

## Development

The library uses Node built-ins only; please do not add dependencies.

Run the unit tests with `npm run test:unit`.
