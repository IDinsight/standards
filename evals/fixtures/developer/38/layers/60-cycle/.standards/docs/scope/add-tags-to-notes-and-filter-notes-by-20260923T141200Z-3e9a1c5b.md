<!-- STANDARDS
Artifact: SCOPE
Cycle: add-tags-to-notes-and-filter-notes-by-20260923T141200Z-3e9a1c5b
-->

# Note Tags

## Goal

Let users label notes with tags and list only the notes that carry a given
tag, so a growing notebook stays easy to navigate.

## Constraints

- Existing callers of `createNote`, `listNotes`, and `formatNote` keep working
  without changes.

## Non-goals

- Renaming or removing a tag across all notes.
- Editing the tags of an existing note.
- Persisting notes to disk.

## Work

### 1. Tagged notes

**Intent:** Users can attach tags when they create a note and narrow a listing
to one tag.

**Done when:**

- `AC-001`: A note can be created with zero or more tags; stored tags are
  trimmed, lowercase, free of duplicates, and keep the order in which they were
  first given.
- `AC-002`: Listing notes with a tag returns only the notes that carry it,
  matching case-insensitively, in creation order.
- `AC-003`: A note created without tags has an empty tag list, and listing
  without a tag returns every note as before.

**Depends on:** None

### 2. Tags in the text export

**Intent:** Exported notes show how they are labelled.

**Done when:**

- `AC-004`: The plain-text export shows a note's tags on a `Tags:` line
  directly under its title, and omits the line when the note has no tags.

**Depends on:** 1
