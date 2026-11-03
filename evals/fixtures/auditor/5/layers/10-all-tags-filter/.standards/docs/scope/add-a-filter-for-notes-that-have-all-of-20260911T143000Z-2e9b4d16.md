<!-- STANDARDS
Artifact: SCOPE
Cycle: add-a-filter-for-notes-that-have-all-of-20260911T143000Z-2e9b4d16
-->

# Notes With All Tags

## Goal

Callers can already find the notes that carry any of a set of tags. They also
need the notes that carry every tag in a query, for example all notes tagged
both `work` and `travel`.

## Constraints

- No new dependencies; the library uses Node built-ins only.
- Tags are compared with the existing normalization (trim, then lowercase).

## Non-goals

- Changing the behavior of `notesWithAnyTag`.
- Ranking or sorting results.

## Work

### 1. All-tags filter

**Intent:** Let callers narrow notes to those matching every requested tag.

**Done when:**

- `AC-001`: `notesWithAllTags(notes, tags)` returns, in input order, exactly the notes whose tags include every requested tag after normalization.
- `AC-002`: Calling `notesWithAllTags` with an empty tag list returns every note.
- `AC-003`: `notesWithAllTags` is exported from the package entry point.

**Depends on:** None

### 2. API documentation

**Intent:** Keep the README API list complete for library users.

**Done when:**

- `AC-004`: The README API section describes `notesWithAllTags`.

**Depends on:** 1
