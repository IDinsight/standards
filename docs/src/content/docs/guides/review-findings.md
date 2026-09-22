---
title: Handling Review Findings
description:
  Classify review findings by artifact ownership and affected review kind.
---

The protocol distinguishes implementation review from final-deliverable review.
A finding belongs to the owner of the defective artifact, even when Reviewer is
the role that discovers it. The cycle mode determines whether to route a failure
directly or promote first.

## Check the cycle mode

In `EXPEDITED`, implementation defects may route to Developer, and defects in
the implementation review may route to implementation Reviewer. If the finding
requires any skipped role or guarantee, use
[promotion](../../concepts/states-and-handoffs/#promote-an-expedited-cycle)
through Auditor instead of a failure handoff to that skipped state. Promotion
clears the expedited recovery stack and restarts the standard sequence.

Missing scope, design, testing, or documentation artifacts are not defects
merely because an expedited cycle intentionally omitted them. Review the bounded
request and the applicable Developer and implementation Reviewer gates.

## Classify a standard-cycle finding

- The implementation violates an established contract: `IMPLEMENTATION`.
- The contract does not define required behavior: `ARCHITECTURE`.
- The acceptance condition is ambiguous or incorrect: `SCOPING`.
- A test or verification claim is defective: `VERIFICATION`.
- A guide is wrong or incomplete: `DOCUMENTATION`.
- The review artifact or decision itself is defective: `REVIEW`.

A `REVIEW` failure must identify whether it concerns `IMPLEMENTATION` or
`FINAL_DELIVERABLE` review. Do not route all findings to Developer or classify
every problem found during review as a review defect.

## Preserve the interrupted gate

A legal failure handoff to another state creates a recovery frame whose
`ResumeAt` identifies the interrupted review. The owner corrects its artifact
and identifies completed downstream work that must be re-established.

For example, a scope defect found in implementation review may require revised
architecture, implementation, and testing before that review resumes.

## Return with evidence

Rerun roles preserve the frame and use their normal completion gates. At the
recorded boundary, the workflow returns explicitly to the interrupted review. A
correction is not a reason to bypass the review that discovered the problem.

This guide explains shared protocol behavior. The detailed
[Reviewer procedure](../../roles/reviewer/) remains WIP.
