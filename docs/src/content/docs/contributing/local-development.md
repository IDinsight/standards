---
title: Local Development
description:
  Preview the website, run checks, and understand documentation deployment.
---

Run the commands on this page from the repository root. The website lives in
`docs/`; the root `docs:*` commands run its package scripts for you.

Use Node.js 22.12 or newer and pnpm 10.34.5, as specified in the root
`package.json`. Markdown checks also need `pre-commit`; CI uses version 4.2.0.

## Install and preview

```sh
pnpm install --frozen-lockfile
pnpm run docs:dev
```

Open the URL printed by Astro with the `/standards/` prefix. The development
command generates the protocol and template reference pages before starting the
server.

If the browser still shows old wording, reload it. If that does not help,
restart the development server from this checkout. Changes to protocol or
template sources also need `pnpm run docs:sync-reference` while the server is
running.

## Validate the site

```sh
pnpm run docs:build
pnpm run docs:check-links
```

Build first: the link checker reads the generated files in `docs/dist/`. It
checks local pages, downloads, and heading anchors, including the site's
`/standards/` prefix. It does not check external websites.

To inspect the built site and search index:

```sh
pnpm run docs:preview
```

Rebuild after further edits so the production preview includes them.

## Validate the installer

```sh
pnpm run test:cli
pnpm run test:installer
pnpm run test:package
```

The package test creates a pnpm tarball in a temporary directory, checks the
packed framework assets, and tests installation, reinstallation, and a
compatible upgrade in a temporary project. It does not publish the package or
install STANDARDS into this repository.

## Check Markdown

Run the same Markdown check as CI:

```sh
pre-commit run markdownlint-cli2 --all-files
```

For selected files, including a new page not yet tracked by Git, pass their
paths explicitly:

```sh
pre-commit run markdownlint-cli2 --files docs/src/content/docs/index.md
```

The root `make lint` command runs Prettier in write mode across Markdown,
excluding `PROTOCOL.md`. It can change files beyond the page you are editing and
does not replace the Markdown check above.

## Dependencies and generated files

Use the root `pnpm-lock.yaml` for dependency changes; there is no separate docs
lockfile. Website dependencies belong in `docs/package.json`, while
`pnpm-workspace.yaml` registers the package and enables its generation hooks and
permitted dependency build scripts.

Keep generated output out of commits. Git ignores dependency directories, the
docs cache and build output, generated reference pages, and their downloadable
originals. See [Repository Structure](../repository-structure/) for the source
locations.

## CI and deployment

The repository runs these checks for pull requests:

- **Documentation:** builds with Node.js 24 and runs the local link checker.
- **Installer:** runs the CLI and installer tests and checks the pnpm tarball.
- **Linting:** runs the Markdown check.
- **Secret Scan:** checks pull requests targeting `main` for verified secrets.

The documentation workflow also runs on pushes to `main` and manual runs. After
a successful build, it deploys only non-PR runs on `main` to GitHub Pages. The
repository's Pages source must be **GitHub Actions**.

`docs/astro.config.mjs` sets the site to
[the STANDARDS documentation](https://idinsight.github.io/standards/) and the
base path to `/standards/`. The workflow publishes `docs/dist/`; it does not
need a `gh-pages` branch. Workflow definitions are under `.github/workflows/`.
