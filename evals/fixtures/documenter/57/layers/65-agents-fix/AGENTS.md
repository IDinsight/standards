<!-- standards:start -->

# S.T.A.N.D.A.R.D.S.

This project uses the S.T.A.N.D.A.R.D.S. workflow.

For invocation help, such as `/<role> help`, `$<role> help`, or a question only
about a role's modes, options, targets, or user styles, whether or not that role
was invoked, read the **Role Invocation Help** section of
`.standards/PROTOCOL.md` and the sections it names, and follow them. If that
section cannot be read, change nothing and present no option that discovery has
not verified.

Before acting on an invoked STANDARDS role skill other than Navigator, except
for a help-only request, or on any other STANDARDS workflow request (such as
choosing the next cycle's mode, changing completion policy, or switching
verification cadence; starting, reworking, promoting, cancelling, or signing off
a cycle; or resetting or uninstalling STANDARDS), read all of
`.standards/PROTOCOL.md` (in consecutive parts if a read shows only part of it)
and each chapter in `.standards/protocol/` that its reading guide names for the
current state or request, and follow them. Otherwise, do not change STANDARDS
workflow state or records.
<!-- standards:end -->

## Working in this repository

Notes for coding agents working on the records service.

- Setup: run `pnpm install` in the repository root before running anything.
  This is a pnpm workspace, and `@records/seed` is linked with `workspace:*`.
- Tests: `pnpm --filter export test` runs every `node:test` suite under `test/`.
- TypeScript runs through Node's type stripping. Use explicit `.ts` import
  specifiers; do not use enums or parameter properties.
- Route handlers call `authorize` from `src/auth/authorize.ts` as their first
  step; keep role checks on the server.
- Seed data lives in the workspace package `packages/seed` (`@records/seed`).
