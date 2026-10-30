# tally

Billing service and shared libraries for Tally.

## Layout

pnpm workspace (see `pnpm-workspace.yaml`):

- `services/billing` — plans, invoices, and posting invoices to the ledger.
- `packages/ledger` — append-only ledger of integer-cent postings.
- `packages/money` — money helpers (integer cents).

Services may depend on packages; packages never depend on services. Workspace
dependencies use `workspace:*`.

## Invoices

An invoice is due 30 days after its issue date unless the customer's payment
terms set another number of days (`termsDays`).

## Development

Use Node 22 (see `.nvmrc`). Packages are plain ES modules loaded straight from
`src/`; there is no build step.

    pnpm install
    pnpm test                           # every workspace
    pnpm --filter @tally/billing test   # one workspace
