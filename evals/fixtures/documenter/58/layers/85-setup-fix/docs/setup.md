# Contributor setup

How to get a working checkout of records-admin.

## Prerequisites

- Node.js 22. The service is written in TypeScript and Node runs the `.ts`
  sources directly through type stripping; there is no build step.
- pnpm 10. The root package depends on the `@records/seed` workspace package
  through the `workspace:` protocol, which npm does not support, so install
  with pnpm.

## Install dependencies

From the repository root:

    pnpm install

This links `packages/seed` into the root package. `pnpm-lock.yaml` is
committed and there are no registry dependencies.

## Run the tests

    pnpm --filter export test

The suite uses the built-in `node:test` runner; no database or other service
is needed. Records come from the `@records/seed` workspace package.

## Before opening a pull request

- Run the tests and make sure they pass.
- Keep route handlers checking roles with `authorize` as their first step.
- Update `docs/usage.md` when a route's behavior changes.
