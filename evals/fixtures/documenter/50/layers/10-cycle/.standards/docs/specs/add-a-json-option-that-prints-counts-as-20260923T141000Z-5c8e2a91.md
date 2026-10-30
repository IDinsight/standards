<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-a-json-option-that-prints-counts-as-20260923T141000Z-5c8e2a91
-->

# Technical Design

## Context

`tally` prints one fixed-width row per input (`formatRow` in `src/cli.js`).
The scope adds a machine-readable `--json` mode and keeps the default output
unchanged. Project context is in `.standards/CONTEXT.md`.

## Decision

Add `--json` as a CLI option handled in `src/cli.js`. A new pure module,
`src/format.js`, serializes one count result as one JSON object per line (JSON
Lines). Multiple inputs then stream naturally, and the existing row formatter
stays untouched. No dependencies are added.

## Acceptance Coverage

- `AC-001`: `toJsonLine` in `src/format.js` and the `--json` branch of `run` in `src/cli.js`.
- `AC-002`: `toJsonLine` writes `null` as the file name when the input is standard input.
- `AC-003`: `formatRow` and the default branch of `run` are unchanged; `parseArgs` keeps rejecting other unknown options.
- `AC-004`: No architectural impact — the usage guide is updated in the documentation phase.

## Components

- `src/format.js` (new) — `toJsonLine(counts, name)`, a pure serializer.
- `src/cli.js` — recognizes `--json` and picks the JSON or row formatter per input.

## Interfaces and Contracts

- CLI: `tally --json [--lines] [--words] [--chars] [FILE...]`. With `--json`, the field-selection options are accepted but ignored, and every object carries all three counts.
- Output: one line per input holding a JSON object with keys `file`, `lines`, `words`, and `chars`, in that order. There is no enclosing array.
- `parseArgs` returns `{ fields, files, json }`, where `json` is false unless `--json` is present.
- Exit statuses and error messages are unchanged.

## Technical Acceptance Criteria

- `AC-001`: Each FILE argument produces exactly one output line, which parses as a JSON object with keys `file`, `lines`, `words`, and `chars`; `file` is the argument as given.
- `AC-002`: With no FILE argument, the single object has a null `file`.
- `AC-003`: Without `--json`, output and exit status are byte-for-byte identical to release 1.2.0 for the same arguments and input.

## Build Plan

1. Add `src/format.js` with `toJsonLine(counts, name)`.
2. Teach `parseArgs` the `--json` option and branch on it in `run`.

## Risks and Follow-up

- Field-selection options combined with `--json` are silently ignored; revisit if users ask for filtered JSON.
