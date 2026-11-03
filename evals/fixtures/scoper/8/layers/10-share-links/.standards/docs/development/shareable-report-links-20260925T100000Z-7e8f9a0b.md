<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: shareable-report-links-20260925T100000Z-7e8f9a0b
-->

# Development Plan

`Cycle`: `shareable-report-links-20260925T100000Z-7e8f9a0b` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Add shareable report links.`

## Build Steps

### DEV-001 — Share-link records and tokens

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

A user who can read a report can create a link to it, identified by an
unguessable token.

**Affected Area**

`src/shares.js` (new), `src/store.js` (shares map).

**Expected Outcome**

`createShareLink(store, user, reportId)` returns `{ token, url }` for a report
the user can read and throws the existing `Forbidden` or `NotFound` otherwise;
`resolveShareLink(store, token)` returns the linked report or `null`.

**Self-Check**

`node --test test/reports.test.js test/access.test.js` in the project root on
the working tree before commit: exit 0, 10 passed. Inspected that tokens are 32
hex characters from 16 random bytes.

### DEV-002 — Share routes

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Expose link creation and link opening through the existing request handler.

**Affected Area**

`src/routes.js`.

**Expected Outcome**

`POST /reports/:id/share` returns 201 with `{ token, url }` for a signed-in user
who can read the report (403 or 404 otherwise); `GET /s/:token` returns the
report, or 404 for an unknown token.

**Self-Check**

Same test command in the project root on the working tree before commit: exit
0, 10 passed. Ad hoc `node --input-type=module` script in the project root:
created a link as a team member (201) and opened its URL (200, report body).

**Implementation Notes**

Opening a link does not need a session, so the URL works for whoever it is sent
to.
