---
title: Writing and Checking Documentation
description: Write clear pages and check their navigation and links.
---

Write for someone trying to use the framework. Concepts explain its behavior,
guides address tasks, role pages explain ownership and invocation, and reference
pages provide the exact rules and templates.

## Add a page

Create a Markdown file in the appropriate section under
`docs/src/content/docs/`. Begin with a title and a concise description:

```yaml
---
title: Your Page Title
description: Explain what the reader will learn or accomplish.
---
```

Starlight renders the title as the main heading. Use `##` for the first body
section. Prefer ordinary Markdown and use richer components only when they make
the explanation easier to follow.

Add the page's slug to the relevant sidebar group in `astro.config.mjs`. Use
relative links between published routes, including trailing slashes, and verify
that links reach the built destination rather than a repository file path.

## Use a consistent role-page shape

For an implemented role, cover purpose, when to use it, inputs and output,
available modes, invocation examples, completion and handoff, and boundaries.
Keep mode details on the role page until they justify separate guides.

For an unfinished role, retain its short description based on the protocol, WIP
notice, and sidebar badge. Replace those with validated usage guidance when the
role is ready. Do not add a separate project-status section.

## Preserve authoritative sources

Edit `PROTOCOL.md` or a skill's `template.md` when changing the rules or
required output. Then run:

```sh
pnpm --dir docs run sync-reference
```

When adding a role template, register it in `docs/scripts/sync-reference.mjs`
and link it from the artifact-template index.

The same synchronization runs before development and production builds. If a
source changes while the development server is running, run it again to refresh
the reference pages. Generated reference content preserves the source wording;
titles and heading levels are adapted for the documentation layout.

## Review a documentation change

Check claims against the protocol and skills. Distinguish illustrative examples
from established requirements. Verify that invocation examples start from a
legal state and do not imply automatic skill dispatch.

Build the site, run the local link check, and inspect the changed pages in the
browser. Check sidebar navigation, narrow-screen readability, code blocks, and
search. Run Markdown checks on the handwritten source changes.
