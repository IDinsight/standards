# Project Context

## Project Baseline

- Greenfield project: before this cycle the repository holds only the
  STANDARDS installation (`.standards/`, `.claude/`, `AGENTS.md`,
  `CLAUDE.md`). There is no pre-existing implementation to preserve.
- The active design
  (`.standards/docs/specs/build-a-command-line-tool-that-totals-20260924T090000Z-3e8b1f6a.md`)
  contains planned modules not yet represented in the repository; defer to it
  for their contents.

## Stack and Tooling

- Node.js 22 with ES modules (`"type": "module"`); the scope rules out
  third-party packages. npm and pnpm are available but no dependencies are
  needed.

## Commands

- `node --test <files>`: Node's built-in test runner. No project test script
  exists yet; the exact command is established when tests are added.

## Conventions and Constraints

- Standard library only; no network access or package installation is
  required to build or test.
- Project-facing documentation is not required for this tool.

## Testing and Verification Baseline

- No tests exist yet. `node:test` and `node:assert/strict` are the available
  standard-library tools; command-line behavior can be exercised with
  `node:child_process`.

## Evidence

- `git ls-files` at audit time listed only STANDARDS and client files.
- `node --version` reported v22.
