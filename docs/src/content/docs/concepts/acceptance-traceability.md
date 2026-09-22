---
title: Acceptance Criteria and Traceability
description:
  Carry stable acceptance identifiers from scope to verification evidence.
---

Traceability connects the requested outcome to design and evidence. It lives in
role-owned artifacts, not in a new shared spreadsheet or in `STATE.md`.

These requirements apply to `STANDARD` cycles, including cycles promoted from
`EXPEDITED`. An expedited cycle uses `Active Work.Request` as its change
contract, without Scoper-owned acceptance identifiers. Its narrower
[completion gates](../states-and-handoffs/#expedited-forward-path) do not imply
that formal testing or other skipped phases ran.

## Scoper assigns identity

Every verifiable in-scope obligation must be represented by a scope acceptance
condition. Each condition has a unique `AC-NNN` identifier within the cycle.

Keep separately verifiable obligations separate. For example, runtime behavior
and a user-facing guide may need distinct conditions because their evidence is
established in different workflow phases.

## Architect records coverage

Architect accounts for every current acceptance identifier. The design records
the relevant technical coverage, or an explicit **No architectural impact**
disposition when the condition depends entirely on established nontechnical
behavior or another phase's work.

Technical acceptance criteria reference the same identifiers. Architect does not
rename the scope requirements or change what they mean.

## Evidence follows the same identifiers

Tester accounts for every current identifier. Conditions that should be proven
by testing receive results and evidence or an explicit blocker. Conditions
explicitly dependent on later phases may remain pending for that phase; pending
is not evidence of completion.

Before `AWAITING_USER_SIGNOFF`, every current condition needs sufficient
verification evidence and no unresolved blocker.

## Replanning preserves history

Keep an identifier when the condition retains its meaning. Assign a new,
previously unused identifier when adding or materially replacing a condition.
Record removed and replaced identifiers as retired; do not reuse or renumber
them within the cycle.

Changing the current identifier set also invalidates completed downstream
artifacts that must account for all current conditions until those artifacts are
reconciled. This applies even if the underlying code or design remains otherwise
valid.

See the [scope template](../../reference/templates/scoper/) and
[Acceptance Traceability](../../reference/protocol/#acceptance-traceability).
