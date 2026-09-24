---
title: Synchronizer
description:
  Reconcile completed assessments, the deliverable, and workflow records before
  user sign-off.
---

Synchronizer establishes whether completed assessments and records still apply
to the current deliverable. Reviewer assesses whether the work is sound;
Synchronizer checks that the work offered for sign-off is the work assessed.

## When to use it

Invoke Synchronizer in `SYNCHRONIZING` during a `STANDARD` cycle, normally after
final review or when recovery returns to synchronization. `EXPEDITED` omits it;
a required synchronization guarantee uses
[promotion](../../concepts/states-and-handoffs/#promote-an-expedited-cycle).

## Inputs and output

Synchronizer reads persisted state, scope, design, context, development plan,
verification and review reports, relevant documentation and agent guidance,
recovery, obligations, and blockers. It reconstructs committed and uncommitted
work, including moved/deleted files and affected unchanged content. A clean diff
or a documentation-only change still needs assessment.

The output is `docs/synchronization/<Active Work.Id>.md`, with matching
`SYNCHRONIZATION` provenance and visible cycle ID. Its location is derived from
the ID, without an extra state field. Existing unrelated or incorrectly marked
content at that fixed path blocks dependent work and is preserved.

The [record template](../../reference/templates/synchronizer/) captures assessed
identities, references to existing evidence, concrete discrepancies and owners,
limits, and resume context. It does not duplicate reports or replace the
acceptance records maintained by other roles.

## One procedure for initial work and resumption

There are no separate modes. On resumption, Synchronizer compares current inputs
with recorded identities, invalidates unsupported conclusions, and explains why
retained evidence still applies. Changed acceptance conditions require checking
the entire current inventory under the same IDs.

Repeated runs against unchanged inputs reuse sufficient assessment without
unnecessary rewrites or duplicate discrepancies. “Everything is already
consistent” is a valid outcome after checking the evidence.

## Invoke it

After the workflow has entered `SYNCHRONIZING`:

```text
Codex: $synchronizer Continue the active workflow from .standards/STATE.md.
Claude Code: /synchronizer Continue the active workflow from .standards/STATE.md.
```

Use the command for your client. A skill invocation does not authorize work in a
different role's state or automatically switch roles or models.

## Completion and handoff

The [Synchronization Gate](../../reference/protocol/#synchronization-gate)
requires current, applicable evidence for every acceptance condition and
relevant technical criterion, consistent records, and no unresolved material
discrepancy or reconciliation gap. Existing files and `COMPLETE` labels alone do
not pass it.

Recovery normally follows the role's full gate. If an interrupted assessment is
waiting for a Synchronizer-owned correction, the protocol's narrow
[corrective-return rule](../../reference/protocol/#synchronizer-corrective-return)
lets Synchronizer verify that correction and return while leaving its record
incomplete. It preserves pending owner work and cannot bypass unrelated gaps or
permit sign-off. Full synchronization must still pass before the cycle may enter
`AWAITING_USER_SIGNOFF`, along with the other
[Standard Cycle Completion](../../reference/protocol/#standard-cycle-completion)
requirements, including completed recovery and resolved obligations.

The summary leads with whether work can proceed to sign-off, explains blockers
and their owners, and discloses what remains unvalidated. Readiness is not user
acceptance. The user can sign off, request rework, or cancel.

## Boundaries and remaining dependencies

Synchronizer corrects its own reconciliation record. Code and plan defects go to
Developer; tests and formal evidence to Tester; acceptance meaning to Scoper;
design to Architect; context to Auditor; and review findings or conclusions to
Reviewer in the affected review kind. Project documentation and agent guidance
go to Documenter. Managed framework blocks, installed protocol, and installation
metadata retain installer/protocol ownership. User-authored instructions are
preserved and material conflicts follow the protocol.

Documenter and the installer are still unfinished. The protocol defines the
minimum documentation evidence interface needed here: relevant documents and
content identities, checks/results or limits, and the conditions they support.
It does not prescribe a new documentation report or implement Documenter.
Missing required evidence blocks readiness; Synchronizer cannot supply another
role's completion work. See [Documenter](../documenter/) and
[installation requirements](../../getting-started/installation/).

The package includes authored evaluation scenarios. Structural validation and a
documentation build do not execute those scenarios or validate model behavior.
