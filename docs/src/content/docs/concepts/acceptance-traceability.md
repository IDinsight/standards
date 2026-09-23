---
title: Acceptance Criteria and Traceability
description:
  Carry stable acceptance identifiers from scope to verification evidence.
---

In a `STANDARD` cycle, each requirement has an ID such as `AC-001`. Scope,
design, and test results use the same ID so you can follow the requirement from
request to proof that it works. This is **acceptance traceability**.

These rules also apply after promotion to standard work. Expedited work follows
its [own completion rules](../states-and-handoffs/#expedited-forward-path).

## Scoper assigns identity

Scoper writes an acceptance condition for each outcome that must be checked and
gives it a unique `AC-NNN` ID within the cycle.

Keep independently checked outcomes separate. For example, a feature working
correctly and its user guide being complete need separate conditions because
different roles check them.

## Architect records coverage

For each current ID, Architect records the design decisions or existing
technical behavior that meet the condition. Existing behavior still needs
coverage even when no design change is required.

Use **No architectural impact** only when the condition depends entirely on
established nontechnical behavior or another workflow phase's work. State which
behavior or phase satisfies it.

Technical acceptance criteria use the same IDs without changing the
requirements.

## Evidence follows the same identifiers

Tester accounts for every current ID with evidence, a blocker, or a pending
dependency on a later role. If a test cannot be completed, record what prevents
it. Conditions that depend on later steps, such as documentation, stay pending
until those steps provide evidence under the same ID.

Before `AWAITING_USER_SIGNOFF`, every current condition must have enough
evidence to show it is met, with no unresolved blocker. Pending work is not
proof.

## Replanning preserves history

Keep an ID when its condition still means the same thing. Use a new, unused ID
for a new condition or a changed meaning. Mark removed and replaced IDs as
retired; do not reuse or renumber them within the cycle.

When the set of current IDs changes, update completed documents and results that
must cover the full set. Do this even if the code or design itself still works.

See the [scope template](../../reference/templates/scoper/) and
[protocol rules](../../reference/protocol/#acceptance-traceability).
