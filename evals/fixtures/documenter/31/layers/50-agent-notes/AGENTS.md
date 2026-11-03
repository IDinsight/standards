# Agent notes

Notes for coding agents working on records-admin.

## Running the service

- Install dependencies with `npm install`.
- Build with `npm run build`, which compiles `src/` to `dist/` with `tsc`.
- Start the API with `npm start`; it listens on http://localhost:3000.
- Run the tests with `npx jest`. Specs live next to the code as `*.spec.ts`.

## Working agreements

- Run the full test suite before suggesting a commit, and say which command
  you ran and what it reported.
- Ask before adding a dependency from the registry.
- Route handlers check roles server-side through `src/auth/authorize.ts`.
- Do not edit the seed data in `packages/seed` to make a test pass.

<!-- standards:start -->

# S.T.A.N.D.A.R.D.S.

This project uses the S.T.A.N.D.A.R.D.S. workflow. Before acting on an invoked
STANDARDS role skill, read `.standards/PROTOCOL.md` and the role's chapter,
`.standards/protocol/<role>.md`, and follow them. Workflow state is kept in
`.standards/WORKFLOW.md`. Role commands are installed in `.claude/commands/`.
<!-- standards:end -->
