---
title: Repository Structure
description:
  Find the framework rules, role packages, templates, and website sources.
---

This repository contains both the framework and its documentation website. Start
with the source that owns the change you want to make.

## Main locations

| Path                     | What belongs here                                                     |
| ------------------------ | --------------------------------------------------------------------- |
| `PROTOCOL.md`            | Shared rules for roles, states, handoffs, recovery, and installation. |
| `README.md`              | A high-level introduction and development entry points.               |
| `skills/`                | The nine role packages.                                               |
| `templates/`             | Initial runtime files and client integration templates.               |
| `docs/src/content/docs/` | Website content, including generated references.                      |
| `docs/astro.config.mjs`  | Sidebar navigation, site URL, and base path.                          |
| `docs/scripts/`          | Reference generation and local link checking.                         |
| `.github/workflows/`     | Documentation, Markdown, secret-scan, and release workflows.          |

## Inside a role package

Each directory under `skills/` contains a `SKILL.md` with the role's
instructions, a Codex adapter in `agents/openai.yaml`, and authored evaluation
scenarios in `evals/evals.json`.

Other files depend on the role:

| File or directory | Purpose                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `modes/`          | Instructions for a selected mode; Synchronizer uses one procedure without separate modes. |
| `template.md`     | The required output format; Navigator has no saved output or template.                    |
| `styles/`         | Shared and topic-specific guidance for Developer, Tester, and Documenter.                 |
| `user-styles/`    | Optional, explicitly selected profiles for Developer and Documenter.                      |

Evaluation scenarios describe intended behavior. Parsing their JSON, linting
Markdown, or building the site does not run model evaluations or establish that
the roles passed them.

See [Roles](../../roles/overview/) for behavior and
[Artifact Templates](../../reference/artifact-templates/) for output formats.

## Runtime and client templates

`templates/common/` contains the managed `AGENTS.md` and `CLAUDE.md` integration
blocks, plus initial `.standards/CYCLE_IDS.md` and
`.standards/INSTALLATION.json` files.

`templates/greenfield/` and `templates/brownfield/` contain initial
`.standards/MODE.md` and `.standards/STATE.md` files.
`templates/claude/.claude/settings.json` supplies the Claude Code role
invocation settings.

The CLI in `bin/` and `lib/` installs these templates and the role packages.
Installation and preservation requirements are defined in the
[protocol](../../reference/protocol/#installed-runtime-contract).

## Website sources and generated files

Handwritten pages live under `docs/src/content/docs/`. The sidebar is listed
explicitly in `docs/astro.config.mjs`; adding a file alone does not add a
navigation entry.

`docs/scripts/sync-reference.mjs` generates the Protocol page and eight role
template pages from their repository originals. It also copies downloadable
originals into `docs/public/reference/`. Edit the source files rather than these
generated copies.

The built website goes to `docs/dist/`. `docs/scripts/check-links.mjs` checks
local links and anchors in that output.

## Workspace commands and dependencies

The root `package.json` provides the `docs:*` commands and pins pnpm.
`pnpm-workspace.yaml` includes the docs package, and `pnpm-lock.yaml` records
dependencies for the workspace. Website dependencies and package scripts stay in
`docs/package.json`.

The `Makefile` includes a Markdown formatter and cleanup commands. See
[Local Development](../local-development/) for setup and validation, and
[Writing Documentation](../documentation/) for page conventions.
