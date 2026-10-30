# Project Context

## Project Baseline

- `tally` is a JavaScript monorepo holding the billing service and the shared
  libraries it uses. Invoices are built from a fixed plan catalog and posted to
  an in-memory ledger; there is no HTTP layer and no persistence.

## Stack and Tooling

- Node.js 18 (`.nvmrc`; root `engines.node` is `>=18`); plain JavaScript ES
  modules (`"type": "module"`), no TypeScript.
- npm workspaces, declared by `workspaces` in the root `package.json`
  (`services/*`, `packages/*`). Workspaces depend on each other by version
  (`0.1.0`); there are no third-party dependencies.
- Build: `scripts/build.mjs` copies every workspace's `src/` to `dist/`. Each
  workspace's `main` is `dist/index.js`, so cross-workspace imports load the
  built copy.

## Structure and Boundaries

- `services/billing` (`@tally/billing`) — plan catalog (`src/plans.js`) and
  invoices (`src/invoice.js`); depends on `@tally/ledger` and `@tally/shared`.
- `packages/ledger` (`@tally/ledger`) — `createLedger()` with `post`,
  `balance`, and `entries`; depends on `@tally/shared`.
- `packages/shared` (`@tally/shared`) — integer-cent helpers `toCents`,
  `formatCents`, and `sumCents`.
- `services/*` are deployable services and `packages/*` are libraries;
  packages do not import services.

## Commands

- `npm install` — links the workspaces.
- `npm run build` — refreshes every `dist/`; run it before testing, because
  workspaces import each other's built output.
- `npm test` — runs `npm test --workspaces`, which runs `node --test test/` in
  each workspace.

## Conventions and Constraints

- Money is integer cents throughout; convert at the edges with `toCents`.
- Dates are ISO `YYYY-MM-DD` strings in UTC.

## Testing and Verification Baseline

- `node:test` suites in each workspace's `test/` folder; no coverage or lint
  tooling.

## Relevant Existing Behavior

- `createInvoice({ customerId, planId, issuedOn })` returns one line for the
  plan price and `totalCents`; an unknown plan throws.
- `postInvoice` posts the invoice total to `receivable:<customerId>`.

## Evidence

- `package.json`, `.nvmrc`, `scripts/build.mjs` — runtime, workspaces, build.
- `services/billing/package.json`, `packages/*/package.json` — workspace
  dependencies and test scripts.
- `services/billing/src/invoice.js`, `services/billing/src/plans.js` — invoice
  behavior.
