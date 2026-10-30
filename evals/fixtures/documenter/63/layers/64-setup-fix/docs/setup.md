# Development setup

How to prepare a checkout of records-admin and run its checks. Contributors
and coding agents working in this repository use this page as the reference
for the commands below.

## Requirements

- Node 22. The TypeScript sources run through Node's type stripping, so there
  is no build step or compiler to install.
- pnpm 10.

## Install

From the repository root:

    pnpm install

The workspace links `@records/seed` from `packages/seed/`; nothing is fetched
from the npm registry.

## Run the checks

From the repository root:

    pnpm --filter export test

`export` is the root package's name in `package.json`. This runs every
`test/*.test.ts` suite with `node:test` and ends with a summary of passed and
failed tests. There is no linter or typechecker.

A `--filter` value that matches no package runs nothing and still exits 0
(pnpm prints "No projects matched the filters"), so check that the test
summary appears.

## Seed data

The in-memory store starts with the six records in `packages/seed/index.js`.
Tests that need other data pass their own records to `RecordStore` or
`createApp`.
