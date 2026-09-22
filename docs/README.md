# S.T.A.N.D.A.R.D.S. Documentation

This directory contains the Starlight documentation website. Use Node.js 22.12
or newer and pnpm 10.34.5. Run these commands from the repository root:

```sh
pnpm --dir docs install --frozen-lockfile
pnpm --dir docs run dev
```

To verify and preview the production site:

```sh
pnpm --dir docs run build
pnpm --dir docs run check-links
pnpm --dir docs run preview
```

Handwritten pages live in `src/content/docs/`; navigation is configured in
`astro.config.mjs`. The full writing guide is available at
`/standards/contributing/documentation/` in the local site.

The protocol and artifact-template reference pages are generated from the
repository sources before development and builds. If those sources change while
the server is running, run `pnpm --dir docs run sync-reference` again. Do not
edit or commit generated reference copies.

## GitHub Pages

The site is configured for <https://idinsight.github.io/standards/>. Local dev
and preview also use the `/standards/` prefix; open the URL printed by Astro.

In the repository's **Settings → Pages → Build and deployment**, set **Source**
to **GitHub Actions**. The `.github/workflows/docs.yml` workflow builds and
checks pull requests, then deploys pushes to `main`. It can also be run manually
on `main`. No `gh-pages` branch is needed. Commit the docs sources and pnpm
lockfile; the workflow publishes the generated `docs/dist/` output.
