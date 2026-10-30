<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: migrate-records-to-json-file-20260921T143000Z-5e9b2c71
-->

# Technical Design

## Context

`RecordStore` in `src/records/store.ts` holds copies of the seed records in
memory; `createApp` builds it from `@records/seed`. Route handlers only call
`list` and `get`.

## Decision

Add `FileRecordStore` with the same `list` and `get` contract, backed by a
JSON array in a file. `createApp` takes a `dataFile` option; without it the
in-memory store and seed are used as today. A separate script migrates the
seed records into the file.

## Acceptance Coverage

- `AC-001`: `FileRecordStore` in `src/records/fileStore.ts` reads the file on
  construction and rewrites it atomically (write to a temporary file, then
  rename) on every change; `createApp({ dataFile })` selects it.
- `AC-002`: `scripts/migrate-records.mjs --file <path>` writes `seedRecords`
  to the file when it is missing or empty and otherwise leaves it unchanged.

## Interfaces and Contracts

- File format: UTF-8 JSON array of `RecordItem` objects ordered by `id`.
- `package.json` gains a `migrate` script running the migration command.

## Risks and Follow-up

- A corrupted file stops the service from starting; recovery is manual.
