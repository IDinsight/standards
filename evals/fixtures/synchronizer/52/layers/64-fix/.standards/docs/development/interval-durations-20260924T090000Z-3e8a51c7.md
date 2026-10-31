<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: interval-durations-20260924T090000Z-3e8a51c7
-->

# Development Plan

`Cycle`: `interval-durations-20260924T090000Z-3e8a51c7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/interval-durations-20260924T090000Z-3e8a51c7.md`
- `Architecture`: `.standards/docs/specs/interval-durations-20260924T090000Z-3e8a51c7.md`
- `Request`: `Accept human-readable durations such as 1h30m for job intervals.`

## Build Steps

### DEV-001 — Duration parser

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-003`

**Goal**

Provide `parseDuration(text)` in a new module that turns a duration string into
seconds, or `null` when the text is not a valid duration.

**Affected Area**

`src/duration.js` (CREATE).

**Expected Outcome**

`parseDuration('1h30m')` is 5400, `parseDuration('45s')` is 45, and malformed
text, including a part without a unit, returns `null`.

**Self-Check**

In the project root, on the uncommitted working tree that became commit
"Parse human-readable job intervals", ran
`node --input-type=module -e "import { parseDuration } from './src/duration.js'; console.log(parseDuration('1h30m'), parseDuration('45s'), parseDuration('2h'), parseDuration('1x'))"`.
It printed `5400 45 7200 null`.

**Implementation Notes**

Reopened and corrected under Recovery Frame 1 (user rework from sign-off
readiness: an interval of `1h30` loaded as 3630 seconds). The parser treated a
trailing number without a unit as seconds; it now requires a unit on every
part, as the design's grammar states. Correction self-check, in the project
root on the working tree that became commit "Reject interval values with a
trailing bare number":
`node --input-type=module -e "import { parseDuration } from './src/duration.js'; console.log(parseDuration('1h30'), parseDuration('1h30m'), parseDuration('90'))"`
printed `null 5400 null`; `npm test` exited 0 with 5 of 5 passing.

### DEV-002 — Config accepts duration strings

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Route string intervals in the config loader through the parser while keeping
the integer path and the existing error style.

**Affected Area**

`src/config.js` (MODIFY).

**Expected Outcome**

A job with interval `"1h30m"` loads with `intervalSeconds` 5400, integer
intervals load unchanged, and an invalid value throws
`config: <name>: invalid interval <value>`.

**Self-Check**

Same working tree as the first DEV-001 check: `npm test` in the project root
exited 0 with 3 of 3 existing tests passing. A manual `parseConfig` call with
interval `"1h30m"` returned `intervalSeconds` 5400, and interval `"soon"`
threw `config: backup: invalid interval "soon"`. Unchanged by the correction.

## Plan Notes

- Project references loaded: `NONE`.
- Formal tests for the new duration forms are Tester-owned.
- Recovery Frame 1 (owner `DEVELOPING`, resume at `AWAITING_USER_SIGNOFF`):
  correction done in DEV-001. Rerun plan, in order: `TESTING` (REVERIFY AC-003
  and regression for AC-001 and AC-002), `SYNCHRONIZING` (revalidate the
  corrective evidence in the synchronization record against the corrected
  content), `REVIEWING_IMPLEMENTATION` (reassess the ordinary review and
  Implementation-Reviewed closure eligibility). The frame's rerun boundary is
  `REVIEWING_IMPLEMENTATION`; after that assessment passes, the frame returns to
  `AWAITING_USER_SIGNOFF`.
