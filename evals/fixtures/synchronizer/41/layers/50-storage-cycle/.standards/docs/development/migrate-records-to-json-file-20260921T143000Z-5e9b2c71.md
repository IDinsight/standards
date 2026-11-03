<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: migrate-records-to-json-file-20260921T143000Z-5e9b2c71
-->

# Development Plan

`Cycle`: `migrate-records-to-json-file-20260921T143000Z-5e9b2c71` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `IN_PROGRESS`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/migrate-records-to-json-file-20260921T143000Z-5e9b2c71.md`
- `Architecture`: `.standards/docs/specs/migrate-records-to-json-file-20260921T143000Z-5e9b2c71.md`
- `Request`: `Move record storage from the in-memory seed to a JSON file, with a one-time migration of the seed records.`

## Build Steps

### DEV-001 — JSON file record store

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Serve records from a JSON file with the existing `list` and `get` contract.

**Affected Area**

New `src/records/fileStore.ts` (`FileRecordStore`); `src/app.ts` (`dataFile`
option).

**Expected Outcome**

`createApp({ dataFile })` lists and gets records from the file, and records
written through the store are present after a new `createApp` reads the same
file. Without `dataFile`, behavior is unchanged.

**Self-Check**

- `pnpm --filter export test` in the project root on the working tree with
  `src/records/fileStore.ts` and the `src/app.ts` change not yet committed:
  exit 0; 19 tests passed, 0 failed.

### DEV-002 — Seed migration command

`Status`: `IN_PROGRESS` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

Move the seed records into the JSON file once.

**Affected Area**

New `scripts/migrate-records.mjs`; `migrate` script in `package.json`.

**Expected Outcome**

`node scripts/migrate-records.mjs --file <path>` writes the six seed records
to a missing or empty file and leaves an existing file unchanged.

**Self-Check**

Run the command twice against a temporary file and compare the file after
each run. Not yet run.
