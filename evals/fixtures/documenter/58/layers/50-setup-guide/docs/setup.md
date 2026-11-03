# Contributor setup

How to get a working checkout of records-admin.

## Prerequisites

- Node.js 18 or later
- npm (bundled with Node.js)

## Install dependencies

From the repository root:

    npm install

## Run the tests

    npm test

The suite uses the built-in `node:test` runner; no database or other service
is needed. Records come from the `@records/seed` workspace package.

## Before opening a pull request

- Run the tests and make sure they pass.
- Keep route handlers checking roles with `authorize` as their first step.
- Update `docs/usage.md` when a route's behavior changes.
