---
title: Introduction
description:
  Understand how roles, saved work, and independent checks fit together.
---

STANDARDS gives coding agents separate responsibilities for a software change.
One role defines what you want, another designs it, and another implements it.
Testing and review check the work independently before you decide whether to
accept it.

## Work through a cycle

A **cycle** is one piece of work, from its saved request to your sign-off or
cancellation. It can span several chats.

At each step, a role reads the relevant project files, does its work, and checks
the result. When it is ready to move on, it saves progress and gives you a
command to run the next role. This is a **handoff**. You invoke each role
explicitly; the saved workflow state determines which role can act.

For example, Scoper defines the requirements and Architect decides how to meet
them. If Tester later finds a missing design decision, Architect resolves it.
The role that finds a problem does not automatically own the fix.

## Use the workflow the change needs

**Standard work** is the default. It covers requirements, design, project
context, implementation, testing, review, documentation, and a final check that
the completed assessments still apply.

The starting point depends on the project:

- An existing project starts with Auditor to establish the facts the change
  depends on.
- A new project starts with Scoper, then Architect, before its first audit.

**Expedited work** is available for a bounded change to an existing project. It
uses Developer and implementation Reviewer before your sign-off decision. It
provides fewer checks and must move to standard work if a skipped role becomes
necessary.

See [project and cycle modes](../../concepts/project-modes/) for the choices and
the
[visual workflow map](../../concepts/states-and-handoffs/#the-paths-at-a-glance)
for the full sequence.

## Stay involved at the important decisions

Developer saves an implementation plan and waits for your approval before
coding. You can let it work through approved steps, pause after each step, or
code together. See
[Working with Developer](../../guides/working-with-developer/).

Tester uses a chat separate from the implementation conversation. Reviewer uses
a chat separate from all conversations that authored the work being reviewed.
Both assess the saved work and evidence rather than inherit the author's
conclusions.

Once the required checks are complete, you can accept the work, request changes,
or cancel. A passing test or a role's completion does not make that decision for
you.

## Continue from saved work

The installed `.standards/STATE.md` records the request, current step, document
references, and unfinished corrections. Scope, design, plans, and assessment
results stay in their own files.

These records let another session pick up where you left off. They also show
what was checked and what remains unresolved. See
[Resuming Interrupted Work](../../guides/resuming-work/).

## Ask questions at any time

[Navigator](../../roles/navigator/) works outside the workflow. It can explain
the project, investigate a question, or quiz you on a topic, even without an
active cycle. It never edits files or changes workflow state.

## Try a complete example

[Your First Workflow](../first-workflow/) follows a search feature through the
standard workflow. It assumes the project has been set up for STANDARDS. The
[installation page](../installation/) gives the installer command and explains
the runtime files it creates.
