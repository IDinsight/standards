# S.T.A.N.D.A.R.D.S. Documentation

This directory contains the Starlight documentation website, a package in the
root pnpm workspace. Use Node.js 22.12 or newer and pnpm 10.34.5, pinned in the
root `package.json`. Run these commands from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm run docs:dev
```

To verify and preview the current checkout:

```sh
pnpm run docs:build
pnpm run docs:check-links
pnpm run docs:preview
```

Handwritten pages live in `src/content/docs/`; navigation is configured in
`astro.config.mjs`. The full writing guide is available at
`/standards/contributing/documentation/` in the local site.

The protocol, installer, and artifact-template reference pages are generated
from the repository sources before development and builds. If those sources
change while the server is running, run `pnpm run docs:sync-reference` again. Do
not edit or commit generated reference copies.

## Documentation versions

The deployed site serves the latest stable release at `/standards/` and every
supported release at `/standards/v/<version>/`. The header selector preserves
the page and heading when they exist in the selected version; otherwise it opens
that version's overview.

To build and check the combined site:

```sh
git fetch --tags
pnpm run docs:build:versions
pnpm run docs:check-links
pnpm run docs:preview
```

Stable tags from v0.7.4 onward are included automatically, sorted numerically.
Release pages, navigation, and authoritative reference sources come from each
tag. The Roadmap is current project information, so its page and sidebar entry
are shared across versions. The Getting Started, FAQ, and Need Help? sidebar
order is also shared. The current checkout supplies the shared rendering
components and build tools. Historical sources are extracted into temporary
directories rather than copied into the repository. Each snapshot has its own
search index.

Ordinary `docs:dev` and `docs:build` preview only the current checkout, with no
version selector or release banner. Unreleased pages are available locally; they
are published when tagged as a release. Use the combined build to test version
switching.

## GitHub Pages

The site is configured for <https://idinsight.github.io/standards/>. Local dev
and preview also use the `/standards/` prefix; open the URL printed by Astro.

In the repository's **Settings → Pages → Build and deployment**, set **Source**
to **GitHub Actions**. The `.github/workflows/docs.yml` workflow builds and
checks the combined site on pull requests, then deploys pushes to `main` and
stable release tags. It can also be run manually on `main`. Tag-triggered runs
check out `main` for the shared rendering tools and fetch the complete release
history. If the `github-pages` environment restricts deployment branches and
tags, allow `main` and the tag pattern `v*`. No `gh-pages` branch is needed.
Commit the docs sources and root pnpm lockfile; the workflow publishes the
generated `docs/dist/` output.
