---
title: Local Development
description:
  Preview the website, run checks, and understand documentation deployment.
---

These commands are for contributors working on this repository. Run them from
the repository root. If an agent is making the change for you, it can run the
checks and report the results. The website lives in `docs/`; the root `docs:*`
commands run its package scripts.

Use Node.js 22.12 or newer and pnpm 10.34.5, as specified in the root
`package.json`. Markdown checks also need `pre-commit`; CI uses version 4.2.0.

## Install and preview

```sh
pnpm install --frozen-lockfile
pnpm run docs:dev
```

Open the URL printed by Astro with the `/standards/` prefix. The development
command generates the protocol, installer, and template reference pages before
starting the server.

If the browser still shows old wording, reload it. If that does not help,
restart the development server from this checkout. Changes to protocol,
installer, or template sources also need `pnpm run docs:sync-reference` while
the server is running.

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

## Preview documentation versions

The public site shows the latest stable release at `/standards/` and archived
releases at `/standards/v/<version>/`. The version selector keeps the current
page and heading when they exist in the chosen version, or opens its overview if
the page is absent. Older releases display a banner; each version searches its
own pages.

To build the complete site locally:

```sh
git fetch --tags
pnpm run docs:build:versions
pnpm run docs:check-links
pnpm run docs:preview
```

The build includes stable release tags from v0.7.4 onward automatically. Tagged
pages, navigation, protocol, installer, and templates come from that release.
The Roadmap is shared across versions so it can describe current plans. The
current checkout provides shared rendering tools and components. Other new
content is published when tagged as a release. Archives are rebuilt from tags
without committing duplicate documentation trees.

Ordinary `docs:dev` and `docs:build` preview the current checkout, with no
version selector or release banner. Use the combined build to verify the
selector and links across versions.

## Validate the installer

```sh
make test
```

`make test` runs every test file in `test/` (the same as `pnpm test`). To run
one group, use `pnpm run test:cli`, `test:installer`, `test:runtime`,
`test:release`, or `test:package`.

The package test creates a pnpm tarball in a temporary directory, checks the
packed framework assets, and tests installation, reinstallation, reset, a
compatible upgrade, uninstall preview, removal, and fresh installation in a
temporary project. The installer tests also cover preservation of project files
and settings, hooks, reset, ownership failures, and rollback of removals. The
runtime tests run the tools installed in `.standards/bin/` and the hook script
in temporary projects. The release tests simulate releases in a temporary git
repository to check the release checks described below. These checks do not
publish the package or install STANDARDS into this repository.

To preview the local uninstaller against a project before publishing a release:

```sh
node bin/standards.js uninstall --project /absolute/path/to/project --dry-run
```

Remove `--dry-run` only when you intend to remove its installed framework and
saved workflow history. `node bin/standards.js reset` previews and resets the
same way, but only in a project installed with your checkout's version. These
commands run the code in your checkout; `npx @idinsight/standards@latest` uses
the published release, while an existing global command uses its installed
version.

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
excluding `PROTOCOL.md` and `CHANGELOG.md`, and then the JavaScript check below.
Prettier can change files beyond the page you are editing and does not replace
the Markdown check above.

## Check JavaScript

Run the same JavaScript check as CI:

```sh
make lint-js
```

It runs ESLint with its recommended rules over the repository's JavaScript, as
set in `eslint.config.mjs`, and is the same as `pnpm run lint:js`. ESLint needs
Node.js 22.13 or newer.

## Dependencies and generated files

Use the root `pnpm-lock.yaml` for dependency changes; there is no separate docs
lockfile. Website dependencies belong in `docs/package.json`.
`pnpm-workspace.yaml` lists `docs/` as a workspace package and allows the
scripts needed to generate reference pages and build dependencies.

Keep generated output out of commits. Git ignores dependency directories, the
docs cache and build output, generated reference pages, and their downloadable
originals. See [Repository Structure](../repository-structure/) for the source
locations.

## Release versions

release-please opens a release pull request based on the Conventional Commit
messages on `main`. Choose messages with the version in mind, because the
installer upgrades an existing project only within one major version:

- A change needs a major release when it adds, removes, or renames a role, or
  changes runtime files or record formats so that an existing installation's
  files would no longer pass. Existing projects then have to uninstall and
  install again, because STANDARDS has no migration between major versions.
- Mark such a change with `!` after the type, as in `feat!: add a Planner role`,
  or with a `BREAKING CHANGE:` footer. release-please then raises the major
  version, including from `0.x` to `1.0.0`.
- To set a version directly, add a footer such as `Release-As: 2.0.0` to a
  commit.

The **Release Checks** workflow enforces this on pull requests whose
`package.json` version differs from the latest release tag, which is the case on
release-please pull requests. It fails when:

- roles were added, removed, or renamed and the new version is not major; or
- the new version is not major and the new installer cannot upgrade a project
  installed by the previous release. The check installs the previous release,
  loads each saved workflow state and its cycle records from
  `test/fixtures/upgrade/`, upgrades with the pull request's code, and confirms
  that `STATE.md` is unchanged and that `check.mjs` reports no problems.

Run it locally with `pnpm run check:release`; it needs the release tags. Add an
upgrade fixture when a release introduces a new kind of saved state.

Publishing the package to npm is a separate, manual step.

## CI and deployment

The repository runs these checks for pull requests:

- **Documentation:** builds with Node.js 24 and runs the local link checker.
- **Tests:** runs `make test` (the CLI, installer, runtime-tool, and
  release-check tests, and the pnpm tarball check) on Node.js 22.12 and 24, for
  pull requests to `main` and for pushes to any branch.
- **Release Checks:** compares a release pull request with the previous release,
  as described in [Release versions](#release-versions).
- **Linting:** runs the Markdown and JavaScript checks.
- **Secret Scan:** checks pull requests targeting `main` for verified secrets.

The documentation workflow builds all supported versions on pull requests,
pushes to `main`, stable release tag pushes, and manual runs. It deploys
successful non-PR runs on `main` or release tags to GitHub Pages. Tag-triggered
runs check out `main` for the shared rendering tools and fetch all release tags.
Publication waits until the checkout's package version has a release tag, so a
release commit does not publish older docs before its tag is created. The
repository's Pages source must be **GitHub Actions**. If the `github-pages`
environment restricts deployment branches and tags, allow `main` and `v*` tags.

`docs/astro.config.mjs` sets the site to
[the STANDARDS documentation](https://idinsight.github.io/standards/) and the
base path to `/standards/`. The workflow publishes `docs/dist/`; it does not
need a `gh-pages` branch. Workflow definitions are under `.github/workflows/`.
