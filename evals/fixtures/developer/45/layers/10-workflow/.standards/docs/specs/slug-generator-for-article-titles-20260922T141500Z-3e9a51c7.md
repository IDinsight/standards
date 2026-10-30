<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: slug-generator-for-article-titles-20260922T141500Z-3e9a51c7
-->

# Technical Design

## Context

New Node.js 22 project with no existing code and no dependencies allowed.

## Decision

One ES module, `src/slug.js`, exports `slugify(title)` and
`uniqueSlug(title, existing)`. A thin script, `src/cli.js`, imports
`slugify` and handles arguments and exit codes.

## Acceptance Coverage

- `AC-001`: `slugify` applies NFKD normalization, removes combining marks (U+0300 to U+036F), lowercases, replaces each run of characters outside `[a-z0-9]` with one hyphen, and trims hyphens at both ends.
- `AC-002`: `slugify` truncates the result to 60 characters and then removes trailing hyphens.
- `AC-003`: `uniqueSlug` returns the base slug when it is not in `existing`; otherwise it appends `-N` with the smallest N starting at 2 that is not in `existing`.
- `AC-004`: `src/cli.js` joins its arguments with spaces as the title, prints `slugify(title)` to stdout, and exits 1 with a usage line on stderr when no title is given.

## Interfaces and Contracts

- `slugify(title: string): string`
- `uniqueSlug(title: string, existing: Iterable<string>): string`
- CLI: `node src/cli.js <title words...>`; exit 0 on success, 1 on missing title.

## Technical Acceptance Criteria

- `AC-002`: The 60-character limit is a module constant applied after hyphen collapsing.
- `AC-003`: `existing` is read once into a set; it is never modified.

## Build Plan

1. `slugify` with the length limit.
2. `uniqueSlug` on top of `slugify`.
3. Command-line entry point.
