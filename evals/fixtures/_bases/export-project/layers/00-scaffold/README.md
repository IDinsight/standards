# records-admin

Backend for the internal records admin tool: an in-memory record store seeded
from `@records/seed`.

## Development

Requires Node 22 and pnpm.

    pnpm install
    pnpm --filter export test

TypeScript runs through Node's type stripping; there is no build step.
