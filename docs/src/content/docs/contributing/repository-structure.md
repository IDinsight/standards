---
title: Repository Structure
description:
  Find the framework rules, role packages, templates, and website sources.
---

This repository contains both the framework and its documentation website. Start
with the file responsible for the part you want to change.

## Main locations

| Path                     | What belongs here                                                    |
| ------------------------ | -------------------------------------------------------------------- |
| `PROTOCOL.md`            | Shared rules for roles, states, handoffs, recovery, and the runtime. |
| `protocol/`              | Protocol chapters, installed into `.standards/protocol/`.            |
| `INSTALLER.md`           | Rules for the CLI's install, upgrade, and uninstall; not installed.  |
| `README.md`              | A high-level introduction and development entry points.              |
| `skills/`                | The nine role packages.                                              |
| `runtime/`               | Tools installed into `.standards/bin/`, including `check.mjs`.       |
| `templates/`             | Initial runtime files and client integration templates.              |
| `docs/src/content/docs/` | Website content, including generated references.                     |
| `docs/astro.config.mjs`  | Sidebar navigation, site URL, and base path.                         |
| `docs/scripts/`          | Reference generation and local link checking.                        |
| `scripts/`               | The release checks run in CI (`pnpm run check:release`).             |
| `test/`                  | Tests, and saved workflow states for the upgrade check.              |
| `.github/workflows/`     | Tests, documentation, Markdown, secrets, release checks, releases.   |

## Inside a role package

Each directory under `skills/` contains a `SKILL.md` with the role's
instructions, a Codex adapter in `agents/openai.yaml`, and authored evaluation
scenarios in `evals/evals.json`. The `evals/` folder is for developing the
skills: it stays in this repository, and neither the npm package nor an
installed project includes it.

Other files depend on the role:

| File or directory | Purpose                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `modes/`          | Instructions for a selected mode; Synchronizer uses one procedure without separate modes. |
| `template.md`     | The required output format; Navigator has no saved output or template.                    |
| `styles/`         | Shared and topic-specific guidance for Developer, Tester, and Documenter.                 |

Role packages ship no user styles. Users add their own in a project under
`.standards/user-styles/<role>/`; see
[User styles](../../reference/runtime-files/#user-styles).

Evaluation scenarios describe intended role behavior. Checking their JSON,
linting Markdown, or building the site does not run those evaluations or show
that the roles passed them.

See [Roles](../../roles/overview/) for behavior and
[Artifact Templates](../../reference/artifact-templates/) for output formats.

## Installation templates

`templates/common/` contains the STANDARDS sections added to `AGENTS.md` and
`CLAUDE.md`, plus an initial `.standards/INSTALLATION.json` file.

`templates/greenfield/` and `templates/brownfield/` contain initial
`.standards/MODE.md` and `.standards/STATE.md` files, which `standards reset`
also uses. `templates/claude/.claude/settings.json` is the starting Claude Code
settings file; the installer adds the role invocation settings. The stop hook
definitions are in `templates/claude/settings-hooks.json` for Claude Code and
`templates/codex/.codex/hooks.json` for Codex.

The published CLI in `bin/` and `lib/` installs these templates, the protocol
and its chapters, the role packages without their `evals/` folders, and the
tools in `runtime/`, which it copies to `.standards/bin/`. Installation and
preservation requirements are defined in the
[Installer Contract](../../reference/installer/).

## Website sources and generated files

Handwritten pages live under `docs/src/content/docs/`. The sidebar is listed
explicitly in `docs/astro.config.mjs`; adding a file alone does not add a
navigation entry.

`docs/scripts/sync-reference.mjs` generates the Protocol and Installer Contract
pages and eight role template pages from their repository originals. It also
copies downloadable originals into `docs/public/reference/`. Edit the source
files rather than these generated copies.

The built website goes to `docs/dist/`. `docs/scripts/check-links.mjs` checks
local links and anchors in that output.

## Workspace commands and dependencies

The root `package.json` provides the `docs:*` commands and pins pnpm.
`pnpm-workspace.yaml` includes the docs package, and `pnpm-lock.yaml` records
dependencies for the workspace. Website dependencies and package scripts stay in
`docs/package.json`.

The `Makefile` includes a Markdown formatter, the JavaScript lint, and cleanup
commands. `eslint.config.mjs` sets the JavaScript lint rules. See
[Local Development](../local-development/) for setup and validation, and
[Writing Documentation](../documentation/) for page conventions.
