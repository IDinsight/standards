<!-- STANDARDS
Artifact: SCOPE
Cycle: filter-notes-by-tag-20260923T141200Z-5c8e2a91
-->

# Note Tag Filter

## Goal

Let callers narrow the note list to a single tag so users can find related
notes without scanning everything.

## Non-goals

- Filtering by more than one tag at a time.
- Changing how tags are stored on create.

## Work

### 1. Filter the note list by tag

**Intent:** Users can see only the notes that carry a chosen tag.

**Done when:**

- `AC-001`: Listing notes with a tag returns only the listed notes that carry that tag, matching case-insensitively and ignoring surrounding whitespace.
- `AC-002`: Listing notes without a tag returns the same notes in the same order as before this change.
- `AC-003`: Listing notes with a tag that no note carries returns an empty list.

**Depends on:** None
