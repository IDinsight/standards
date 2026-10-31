<!-- STANDARDS
Artifact: SCOPE
Cycle: notes-word-counts-20260924T090000Z-5c8e2a1f
-->

# Notes Export Word Counts

## Goal

Readers of the exported Markdown want to see how long each note is and how much
writing the whole export contains, without counting by hand.

## Constraints

- Workflow instruction from the user: development uses STEPWISE collaboration,
  with each step reviewed before the next begins.
- The export stays a single Markdown document written by the existing command.

## Non-goals

- Counting words in note titles.
- Character counts, reading-time estimates, or per-tag totals.
- Changes to the JSON input format or the loader's validation.

## Work

### 1. Word counts in the Markdown export

**Intent:** Show the length of each note and of the whole export.

**Done when:**

- `AC-001`: Each exported note shows a `Words: N` line after its body, where N
  is the number of whitespace-separated words in the body.
- `AC-002`: The export ends with a `Total words: N` line equal to the sum of the
  per-note counts.
- `AC-003`: A note whose body is empty or only whitespace shows `Words: 0`.
- `AC-004`: The heading, trimmed body, and blank-line separation between notes
  are unchanged apart from the added count lines.

**Depends on:** None
