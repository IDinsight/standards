<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: shareable-report-links-20260925T100000Z-7e8f9a0b
-->

# Development Plan

`Cycle`: `shareable-report-links-20260925T100000Z-7e8f9a0b` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Report owners create a read-only share link that opens a report without signing in and expires after 7 days.`

## Build Steps

### DEV-001 — Scoped signed tokens

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Let the existing token signer carry a purpose so one signing path can issue
both session tokens and share tokens.

**Affected Area**

`src/tokens.js`, session authentication in `src/api.js`, `test/tokens.test.js`.

**Expected Outcome**

`signToken` accepts an optional `scope` (default `session`) that is covered by
the signature; `verifyToken` returns the scope; API authentication accepts only
`session` tokens.

**Self-Check**

`node --test test/tokens.test.js test/api.test.js` from the project root on the
working tree with DEV-001 applied: exit 0, no failures.

**Implementation Notes**

Token layout is now `<scope>.<userId>.<expiresAt>.<signature>`; the format test
in `test/tokens.test.js` was updated to the new layout.

### DEV-002 — Share link routes

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Owners create a 7-day read-only link to one report; anyone with the link can
read that report without signing in.

**Affected Area**

`src/api.js`, new `test/shares.test.js`, the `test` script in `package.json`.

**Expected Outcome**

`POST /reports/:id/share` (owner only) returns `{ url, expiresAt }` for a
`share:<id>` token valid for 7 days; `GET /shared/:token` returns
`{ id, title, rows }` without authentication, or `404` when the token is
invalid, expired, or does not match the report.

**Self-Check**

`npm test` from the project root on the working tree with DEV-001 and DEV-002
applied: exit 0, all four test files passed.

## Plan Notes

Expedited cycle: no Scope or Architecture artifacts. Share tokens reuse the
session signing path and `REPORTDESK_SECRET`.
