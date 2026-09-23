---
title: Roles and Artifact Ownership
description: Understand which role may change each decision or file.
---

Each role is responsible for specific decisions and files. Finding a problem
does not give a role permission to fix another role's work.

## Three distinct records

- **Scope:** what to build and what counts as done. Scoper owns it.
- **Technical design:** how to build it. Architect owns it.
- **Project context:** what already exists and what the change must respect.
  Auditor owns it. These established facts are the project's **baseline**.

A proposed design is still a proposal, even if it appears in the context file.
Keep existing facts separate from planned changes.

## Coordination has its own rules

Roles may update `MODE.md` and `STATE.md` only as the protocol requires, such as
to change state, save a file path, or record an unanswered question. They cannot
edit the installed `PROTOCOL.md` to change those rules.

## Finding a problem outside your role

Suppose Tester finds that the design never specified retry behavior. That is an
`ARCHITECTURE` failure: Architect must decide the behavior. Tester must not
choose it by writing a test.

If the design already specifies retries and the test checks the wrong behavior,
that is a `VERIFICATION` failure for Tester to fix.

[Failure Recovery](../recovery/) explains how to return work to the right role.
See the [role overview](../../roles/overview/) for all responsibilities.

## Navigator is different

Navigator explains and investigates at any point in the workflow. It never
changes project files or workflow state.
