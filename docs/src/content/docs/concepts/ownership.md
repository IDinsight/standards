---
title: Roles and Artifact Ownership
description: Understand which role may change each decision or artifact.
---

Ownership answers a specific question: **who may correct this artifact or change
this decision?** The role that finds a problem is not automatically the role
that fixes it.

## Three distinct records

- **Scope** records what must be built and what counts as done. Scoper owns it.
- **Technical design** records material implementation decisions. Architect owns
  it.
- **Project context** records the relevant existing baseline. Auditor owns it.

A proposed architecture does not become an established project constraint just
because it is mentioned in the context file. Context must distinguish current
repository facts from planned changes.

## Coordination has its own rules

`MODE.md` and `STATE.md` are protocol-owned coordination artifacts. Roles may
update them only for legal transitions or required bookkeeping, such as
recording an artifact path or a blocking question.

The installed `PROTOCOL.md` is framework-owned. Workflow roles do not edit it to
make a difficult transition legal.

## Finding a problem outside your role

Suppose Tester discovers that the design never specified retry behavior. That is
an `ARCHITECTURE` failure. Architect must resolve the contract; Tester should
not silently choose the intended behavior in a test.

Conversely, a test that incorrectly checks an already-defined contract is a
`VERIFICATION` failure. Its owner is Tester.

[Failure Recovery](../recovery/) explains how the workflow returns to the
interrupted work after correction.

## Navigator is different

Navigator explains and investigates without modifying artifacts or workflow
state. It may be invoked at any point, but it cannot repair a defect or advance
the workflow under the guise of explanation.

See the [role overview](../../roles/overview/) for the full ownership map.
