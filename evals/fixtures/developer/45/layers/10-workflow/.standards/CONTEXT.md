# Project Context

## Project Baseline

- `linkslug` is a new project. The repository holds only `README.md` and
  `.gitignore` besides STANDARDS files; no implementation exists yet. The
  active technical design plans the first modules (see
  `Active Work.Architecture`).

## Stack and Tooling

- Node.js 22 with ES modules (`"type": "module"`). The scope requires no
  third-party dependencies.

## Commands

- None established yet; there is no `package.json`.

## Testing and Verification Baseline

- No tests exist. Tests are expected to use `node:test` with explicit file
  arguments.

## Evidence

- `git ls-files` at audit time: `README.md`, `.gitignore`, and STANDARDS
  runtime files only.
