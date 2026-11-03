<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-a-dry-run-flag-to-the-prune-command-20260924T081500Z-5c8e2a91
-->

# Development Plan

`Cycle`: `add-a-dry-run-flag-to-the-prune-command-20260924T081500Z-5c8e2a91`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Add a --dry-run flag to the prune command that lists the files it would delete without deleting them.`

## Build Steps

### DEV-001 — Dry-run mode for the prune command

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Let an operator see which log files `logprune` would remove before removing
them.

**Affected Area**

`src/cli.js` (option parsing and output) and `src/prune.js` (`prune` options).
`bin/logprune.js` is unchanged.

**Expected Outcome**

`logprune <dir> --dry-run` prints `would remove <name>` for each expired log
file and deletes nothing. Without the flag, selection, deletion, output, and
exit codes are unchanged.

**Self-Check**

- `node --test test/prune.test.js test/cli.test.js` in the project root on the
  working tree containing the change, before it was committed: exit 0, 4 tests
  passed. The existing tests cover the non-dry-run path only.
- Manual run in a temporary directory with `app.log.1` (30 days old) and
  `app.log` (new): `node bin/logprune.js <tmp> --dry-run` printed
  `would remove app.log.1`, exit 0, and both files remained; the same command
  without `--dry-run` printed `removed app.log.1` and deleted it.

## Plan Notes

Expedited cycle: implementation review follows directly after this plan.
