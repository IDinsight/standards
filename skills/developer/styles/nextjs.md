# Next.js Development Style

Apply with `universal.md` and the applicable language style for Next.js code.
Also apply `react.md` and `html.md` when the affected work materially changes
rendered React UI, and `css.md` when it materially changes styling.

- Inspect the installed Next.js version and the project's existing router and
  conventions before using framework APIs. Do not assume App Router or Pages
  Router behavior from memory.
- When the project uses App Router, prefer Server Components for components that
  do not require browser-only APIs, interactive state, or client hooks. Add
  `"use client"` only at the smallest necessary boundary.
- Keep secrets, privileged data access, and server-only dependencies out of
  client bundles.
- Make caching, revalidation, dynamic rendering, and request-time behavior
  explicit when they affect correctness. Follow the installed version's actual
  semantics.
- Validate input at route, action, webhook, and other trust boundaries before
  using it.
- Preserve the project's established error, loading, not-found, and redirect
  patterns.
- Use framework-native navigation, asset, metadata, and route primitives when
  the project has standardized on them; do not introduce parallel mechanisms
  without an established reason.
- Avoid duplicating business logic between server and client layers. Put shared
  domain logic in an appropriate non-framework boundary when the architecture
  supports it.
- Do not change deployment, runtime, middleware, edge/server placement, or
  persistence strategy as an incidental implementation choice when those are
  consequential architectural decisions.
