# Development setup

How to get a working copy of the records service running on your machine.

## Installation

Install Node.js 18 or later and pnpm 10, then install the workspace from the
repository root:

    pnpm install

This links the `@records/seed` workspace package into `node_modules`. The
project has no registry dependencies.

## Sample data

There is no database to prepare. Each time `createApp()` starts, it copies the
six sample records from the workspace package `@records/seed`
(`packages/seed/index.js`) into an in-memory store; nothing is saved to disk.
To start with other records, for example in a test, pass them to `createApp`:

    createApp({ records: myRecords })

## Running the tests

    pnpm --filter export test

This runs the suites in `test/` with `node:test`. TypeScript files run
directly; there is no build step.

## Project layout

See the layout section of the [README](../README.md).
