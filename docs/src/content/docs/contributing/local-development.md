---
title: Local Development
description: Run the documentation website and repository Markdown checks.
---

The documentation website is a separate pnpm project under `docs/`. Use a
supported Node.js release satisfying the version range in `docs/package.json`
(Node.js 22.12 or newer) and pnpm 10.34.5, pinned in `packageManager`.

## Install and preview

From the repository root:

```sh
pnpm --dir docs install --frozen-lockfile
pnpm --dir docs run dev
```

Open the local URL printed by Astro, including its `/standards/` prefix. The
development command first synchronizes the protocol and template references,
then starts the server.

## Build and check links

```sh
pnpm --dir docs run build
pnpm --dir docs run check-links
pnpm --dir docs run preview
```

The build writes the static site to `docs/dist/`. The link check validates local
links and fragment targets in that output. It does not request external sites.
The production preview is useful for checking the generated search index.

## Markdown checks

The repository's pre-commit hook checks Markdown style:

```sh
pre-commit run markdownlint-cli2 --all-files
```

To include a newly created page before it is tracked, pass its path explicitly:

```sh
pre-commit run markdownlint-cli2 --files docs/src/content/docs/index.md
```

The root `make lint` target runs Prettier in write mode. It formats Markdown; it
does not replace markdownlint's checks. Review its changes before committing.

## Dependencies and generated files

Commit `docs/pnpm-lock.yaml` when dependencies change. Do not commit
`node_modules/`, `.astro/`, `dist/`, or generated reference copies. Their
patterns are listed in `docs/.gitignore`. The docs-local `pnpm-workspace.yaml`
keeps reference-generation hooks enabled and permits the existing native
dependency install scripts.

## GitHub Pages deployment

`.github/workflows/docs.yml` builds and checks pull requests and deploys pushes
or manual runs on `main`. GitHub Pages must use **GitHub Actions** as its source
in the repository settings. The workflow uses the docs project's pinned pnpm
version and publishes `docs/dist/` without a `gh-pages` branch.

`astro.config.mjs` sets the public site to
<https://idinsight.github.io/standards/> using the `/standards/` base path.
Local development and preview use that prefix too. The link checker reads this
configuration to validate deployed URLs against the generated files.
