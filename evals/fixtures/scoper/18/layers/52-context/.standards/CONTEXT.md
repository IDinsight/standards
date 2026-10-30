# Project Context

## Project Baseline

- New greenfield repository for a habit streak tracker CLI. No project
  implementation exists yet; the repository holds only STANDARDS workflow files
  and agent client configuration.

## Stack and Tooling

- Node.js 22 and git are available in the development environment.
- No package manifest, dependencies, or lockfile exist yet.

## Structure and Boundaries

- `.standards/` — workflow state and cycle records; not project implementation.
- `.claude/`, `AGENTS.md`, `CLAUDE.md` — agent client configuration and
  instructions.

## Commands

- None established yet; there are no build, run, or test commands.

## Testing and Verification Baseline

- No tests or test runner exist yet.

## Known Unknowns

- The active design contains planned changes not yet represented by the
  repository; see `Active Work.Architecture` for their contents.

## Evidence

- `git ls-files` — tracked files are limited to the paths listed above.
- `node --version` — Node.js 22 is installed.
