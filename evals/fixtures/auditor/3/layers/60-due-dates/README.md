# tally

Billing service and shared libraries for Tally.

## Layout

npm workspaces (see `workspaces` in `package.json`):

- `services/billing` — plans, invoices, and posting invoices to the ledger.
- `packages/ledger` — append-only ledger of integer-cent postings.
- `packages/shared` — money helpers (integer cents).

## Invoices

An invoice is due 30 days after its issue date unless the customer's payment
terms set another number of days (`termsDays`).

## Development

Use Node 18 (see `.nvmrc`).

    npm install
    npm run build
    npm test
