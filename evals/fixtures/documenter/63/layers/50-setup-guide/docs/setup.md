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

    pnpm --filter records-admin test

This runs every `test/*.test.ts` suite with `node:test`. There is no linter or
typechecker.

## Seed data

The in-memory store starts with the six records in `packages/seed/index.js`.
Tests that need other data pass their own records to `RecordStore` or
`createApp`.
