---
title: Writing and Checking Documentation
description: Write useful pages and keep them consistent with the framework.
---

Write for someone trying to understand or use STANDARDS. Explain what they need
to know or do, using plain language and concrete examples. Keep exact field
names and technical details where readers need them.

## Choose the right section

| Section         | Purpose                                                            |
| --------------- | ------------------------------------------------------------------ |
| Getting Started | Introduce the framework and help readers begin.                    |
| Roles           | Explain what each role does and how to use it.                     |
| Guides          | Walk through a task.                                               |
| Concepts        | Explain how the framework works and why its rules matter.          |
| Reference       | Define terms and provide exact rules, formats, and file locations. |
| Contributing    | Help people change and check this repository.                      |

Link to an existing explanation rather than repeat it. A guide can refer to the
protocol for exact state updates while concentrating on the user's task.

## Add or update a page

Handwritten pages live under `docs/src/content/docs/`. Start with a title and a
short description:

```yaml
---
title: Your Page Title
description: What the reader will learn or accomplish.
---
```

Starlight uses the title as the page's main heading. Use `##` for sections and
`###` for subsections. Prefer ordinary Markdown; use tables for comparisons and
examples when they make an explanation easier to follow.

Add a new page's slug to `docs/astro.config.mjs` to include it in the sidebar.
For example, `roles/scoper.md` uses the slug `roles/scoper`. Link to published
page routes with trailing slashes, rather than to source files. When renaming a
heading, update links to its anchor.

## Keep related pages consistent

Role pages explain purpose, when to run the role, inputs and output, modes,
completion, and boundaries. Include invocation examples.

Use a `## Modes` section with a separate `### MODE_NAME` subsection for each
mode, even when its description is short. Synchronizer's section explains that
it has no separate modes. Navigator describes conversational results and
stopping; it has no saved report or workflow completion step.

Keep glossary entries alphabetical, with one term per `##` heading. Explain
necessary terminology on first use elsewhere so readers do not need to consult
the glossary for every paragraph.

## Edit the source of generated pages

The Protocol page and eight template pages are generated from `PROTOCOL.md` and
`skills/<role>/template.md`. Their wording comes from those files. Update the
original when changing a rule or required format, then run:

```sh
pnpm run docs:sync-reference
```

The command also runs before development and production builds. Run it again if
a source changes while the development server is already running.

`docs/scripts/sync-reference.mjs` controls the generated introductions, titles,
and guide links. Register a new template there and link it from the
[template index](../../reference/artifact-templates/). Generated page copies and
downloadable originals are ignored by Git.

A documentation-only rewrite should describe the current rules. A behavior
change needs a coordinated update to the protocol, affected role packages,
examples, and documentation.

## Check the result

Check claims against the protocol and role instructions. Invocation examples
must respect the current workflow state and explicit invocation rules.
Distinguish examples and authored evaluation scenarios from checks actually run;
a successful docs build does not prove a role behaves correctly.

Use the [local validation commands](../local-development/#validate-the-site),
then inspect the changed pages in the browser. Check the sidebar and “On this
page” links, tables and code blocks, readability on narrow screens, and search
in the production preview. Confirm that the browser is showing the new wording.
