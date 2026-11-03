<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-due-dates-to-invoices-based-on-20260311T101500Z-3c9e51a7
-->

# Development Plan

`Cycle`: `add-due-dates-to-invoices-based-on-20260311T101500Z-3c9e51a7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-due-dates-to-invoices-based-on-20260311T101500Z-3c9e51a7.md`
- `Architecture`: `.standards/docs/specs/add-due-dates-to-invoices-based-on-20260311T101500Z-3c9e51a7.md`
- `Request`: `Add due dates to invoices based on customer payment terms.`

## Build Steps

### DEV-001 — Invoice due dates from payment terms

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

`createInvoice` accepts `termsDays` and returns `dueOn`.

**Affected Area**

`services/billing/src/invoice.js`.

**Expected Outcome**

Every invoice carries `dueOn`, equal to `issuedOn` plus `termsDays` (default
30) computed at UTC midnight.

**Self-Check**

`npm run build && npm test` in the project root on Node 18.19.1, working tree
based on `${COMMIT:Initial monorepo}` plus the STANDARDS install, with the
`invoice.js` change uncommitted; exit 0, all workspace suites passed.
