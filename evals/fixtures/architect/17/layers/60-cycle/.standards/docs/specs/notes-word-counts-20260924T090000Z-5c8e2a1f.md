<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: notes-word-counts-20260924T090000Z-5c8e2a1f
-->

# Technical Design

## Context

The completed scope adds per-note and total word counts to the Markdown export.
The format is defined by `noteToMarkdown` and `toMarkdown` in `src/export.js`
and written by `bin/export.js`; notes are loaded and validated by `loadNotes`
in `src/store.js` (see `.standards/CONTEXT.md`). The project uses plain ES
modules with no dependencies and `node:test`.

## Decision

Compute counts inside `src/export.js` with a new exported `countWords(text)`
helper. Each rendered note gains a `Words: N` line, and `toMarkdown` appends a
single `Total words: N` line. The loader and the command-line entry point stay
unchanged. Keeping the counts beside the rendering keeps the whole export
format in one module.

## Acceptance Coverage

- `AC-001`: `noteToMarkdown` appends `Words: N` using `countWords(note.body)`.
- `AC-002`: `toMarkdown` appends `Total words: N`, the sum of `countWords` over
  all note bodies.
- `AC-003`: `countWords` returns 0 for an empty or whitespace-only body.
- `AC-004`: the existing heading, trimmed body, and separator output are kept;
  only the count lines are added.

## Interfaces and Contracts

- `countWords(text)`: trims the text; returns 0 when nothing remains, otherwise
  the number of runs of non-whitespace characters (split on `/\s+/`).
- Note block: heading line, blank line, trimmed body, blank line, `Words: N`
  line. Blocks stay separated by one blank line.
- Document end: after the last note block, a blank line and `Total words: N`.
  An empty note list exports only `Total words: 0`.

## Technical Acceptance Criteria

- `AC-001`, `AC-003`: counts come from the body only, never the title.
- `AC-002`: the total equals the sum of the per-note counts shown.

## Build Plan

1. MODIFY `src/export.js`: add `countWords`, extend `noteToMarkdown` with the
   per-note line and `toMarkdown` with the total line.

## Risks and Follow-up

- `test/export.test.js` asserts the current exact output; those expectations
  change once the count lines are added.
