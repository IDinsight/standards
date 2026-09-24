---
title: Local Development
description: Run the documentation website and repository Markdown checks.
---

The documentation website is the `standards-docs` package under `docs/` in the
root pnpm workspace. Use Node.js 22.12 or newer and pnpm 10.34.5, pinned in the
root `package.json`. Root `docs:*` scripts delegate to the documentation
package.

## Install and preview

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm run docs:dev
```

Open the local URL printed by Astro, including its `/standards/` prefix. The
development command first synchronizes the protocol and template references,
then starts the server.

## Build and check links

```sh
pnpm run docs:build
pnpm run docs:check-links
pnpm run docs:preview
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

Commit the root `pnpm-lock.yaml` when dependencies change. It covers the root
package and `docs/`; there is no separate docs lockfile. Keep Astro dependencies
and scripts in `docs/package.json`, and Astro configuration and TypeScript
settings in `docs/`.

The root `pnpm-workspace.yaml` registers `docs/`, keeps reference-generation
hooks enabled, and permits the existing native dependency install scripts.
Install from the root so pnpm manages dependency locations and package links; do
not move `node_modules/` manually. The root `.gitignore` excludes dependency
directories throughout the repository. `docs/.gitignore` excludes `.astro/`,
`dist/`, and generated reference copies.

## GitHub Pages deployment

`.github/workflows/docs.yml` builds and checks pull requests and deploys pushes
or manual runs on `main`. GitHub Pages must use **GitHub Actions** as its source
in the repository settings. The workflow installs from the root using its pinned
pnpm version and shared lockfile, runs the root documentation commands, and
publishes `docs/dist/` without a `gh-pages` branch.

`astro.config.mjs` sets the public site to
<https://idinsight.github.io/standards/> using the `/standards/` base path.
Local development and preview use that prefix too. The link checker reads this
configuration to validate deployed URLs against the generated files.
