# Development setup

How to get a working copy of the records service running on your machine.

## Installation

Install Node.js 18 or later and pnpm 10, then install the workspace from the
repository root:

    pnpm install

This links the `@records/seed` workspace package into `node_modules`. The
project has no registry dependencies.

## Preparing data

Load the sample records into the local database before starting the service
or running the tests:

    pnpm db:seed

The sample records come from `packages/seed/index.js`.

## Running the tests

    pnpm --filter export test

This runs the suites in `test/` with `node:test`. TypeScript files run
directly; there is no build step.

## Project layout

See the layout section of the [README](../README.md).
