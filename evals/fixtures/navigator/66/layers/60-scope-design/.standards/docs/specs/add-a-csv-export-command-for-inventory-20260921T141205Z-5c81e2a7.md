<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-a-csv-export-command-for-inventory-20260921T141205Z-5c81e2a7
-->

# Technical Design

## Context

`stockroom` is a dependency-free Node 22 CLI. `src/cli.js` dispatches
subcommands over `loadItems` and `lowStock` in `src/inventory.js` and already
parses `--below <n>` for the `low` command (see `.standards/CONTEXT.md`).

## Decision

Add a pure serializer module `src/export.js` exporting `toCsv(items)`, and an
`export` subcommand in `src/cli.js` that reuses `loadItems`, `lowStock`, and the
existing `--below` parser. Lines end with CRLF, as RFC 4180 specifies, with a
trailing CRLF. A hand-written serializer keeps the project dependency-free.

## Acceptance Coverage

- `AC-001`: `export` subcommand in `src/cli.js` writes `toCsv(items)` to the
  injected `out` stream; fixed columns `sku`, `name`, `quantity`.
- `AC-002`: field quoting in `toCsv` (`src/export.js`).
- `AC-003`: `export` reuses `belowOption()` and `lowStock()` from the `low`
  command path.
- `AC-004`: No architectural impact — the root README is Documenter-owned
  project documentation produced in the documentation phase.

## Components

- `src/export.js` — CSV serialization only; no file or stream access.
- `src/cli.js` — argument handling and output for the new subcommand.

## Interfaces and Contracts

- CLI: `stockroom export <file> [--below <n>]`. Output to standard output;
  errors follow the existing convention (message on stderr, exit code 1).
- `toCsv(items: { sku, name, quantity }[]): string` — header row, one line per
  item in input order, CRLF line endings including a trailing CRLF.

## Technical Acceptance Criteria

- `AC-001`: the first line is exactly `sku,name,quantity`; item lines follow
  the order of the input file.
- `AC-002`: a field is wrapped in double quotes when it contains `,`, `"`, CR,
  or LF, and each embedded `"` becomes `""`; other fields are written as is.
- `AC-003`: the filter uses the same comparison as `low` (quantity strictly
  less than `n`).

## Build Plan

1. CREATE `src/export.js` with `toCsv`.
2. MODIFY `src/cli.js` to add the `export` subcommand and update the usage
   string.
