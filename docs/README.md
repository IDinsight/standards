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
`/contributing/documentation/` in the local site.

The protocol and artifact-template reference pages are generated from the
repository sources before development and builds. If those sources change while
the server is running, run `pnpm --dir docs run sync-reference` again. Do not
edit or commit generated reference copies.

The site is local only until a hosting destination and canonical URL are chosen.
