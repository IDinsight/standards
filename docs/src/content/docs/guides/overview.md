---
title: Guides Overview
description: Follow the workflow for your project and find the next guide.
---

Use the workflow maps to find your next step. Links in each diagram open the
guides for that part of the work.

## Standard cycle

Standard work starts differently for new and existing projects. Both entry paths
support full completion or finishing after implementation review.

<!-- markdownlint-disable MD033 -->
<figure
  class="workflow-map workflow-map--cycle"
  aria-labelledby="standard-cycle-caption"
>
  <div class="workflow-map__panel workflow-map__panel--standard">
    <p class="workflow-map__stage-label">Start with your project</p>
    <div class="workflow-map__entries">
      <div class="workflow-map__entry">
        <strong><a href="../new-project/">New project · Greenfield</a></strong>
        <ol class="workflow-map__steps">
          <li>Scoper</li><li>Architect</li><li>Auditor</li>
        </ol>
      </div>
      <div class="workflow-map__entry">
        <strong>
          <a href="../existing-project/">Existing project · Brownfield</a>
        </strong>
        <ol class="workflow-map__steps">
          <li>Auditor</li><li>Scoper</li><li>Architect</li>
        </ol>
      </div>
    </div>
    <div class="workflow-map__join">
      <span aria-hidden="true">↓</span> Both continue with
    </div>
    <ol class="workflow-map__steps">
      <li>
        <a href="../working-with-developer/">Developer</a>
        <span class="workflow-map__detail">Approve the plan, then build</span>
      </li>
      <li>
        Tester
        <span class="workflow-map__detail">Full verification</span>
      </li>
      <li>Implementation Reviewer</li>
    </ol>
    <div class="workflow-map__join">
      <span aria-hidden="true">↓</span> Follow your cycle's completion policy
    </div>
    <div class="workflow-map__branches">
      <section class="workflow-map__branch" aria-labelledby="full-cycle-path">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">Default</span>
          <h3 id="full-cycle-path">Full deliverable</h3>
        </div>
        <ol class="workflow-map__steps workflow-map__steps--vertical">
          <li>Documenter</li><li>Final Reviewer</li><li>Synchronizer</li>
        </ol>
        <div class="workflow-map__finish">
          <div class="workflow-map__down" aria-hidden="true">↓</div>
          <div class="workflow-map__decision">Your sign-off decision</div>
        </div>
        <a
          class="workflow-map__guide"
          href="../../getting-started/first-workflow/#7-document-the-change"
        >Follow the full workflow</a>
      </section>
      <section
        class="workflow-map__branch workflow-map__branch--short"
        aria-labelledby="short-cycle-path"
      >
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">By your explicit choice</span>
          <h3 id="short-cycle-path">Finish after implementation review</h3>
        </div>
        <div class="workflow-map__gate">
          Implementation Reviewer checks whether the cycle can finish
        </div>
        <p class="workflow-map__detail">
          Every requirement has current evidence. No required work remains.
        </p>
        <div class="workflow-map__finish">
          <div class="workflow-map__down" aria-hidden="true">↓</div>
          <div class="workflow-map__decision">Your sign-off decision</div>
        </div>
        <a
          class="workflow-map__guide"
          href="../finishing-after-implementation-review/"
        >Choose the shorter finish</a>
      </section>
    </div>
  </div>
  <figcaption id="standard-cycle-caption">
    Arrows show normal handoffs after the required checks pass. You invoke each
    role explicitly and decide whether to accept the finished work.
  </figcaption>
</figure>
<!-- markdownlint-enable MD033 -->

The default policy is `FULL_DELIVERABLE`. The shorter policy,
`IMPLEMENTATION_REVIEWED`, omits normal documentation, final review, and
synchronization. A passing implementation review alone is not enough: Reviewer
must also confirm that no required work remains. Required documentation still
needs Documenter's evidence through
[recovery](../../concepts/recovery/#corrections-when-finishing-after-implementation-review).

This map shows normal completion. Developer and Tester can also use
[incremental checkpoints](../working-with-developer/#choose-when-tester-runs),
but full verification is still required before implementation review. Tester and
Reviewer need
[independent chats](../../concepts/states-and-handoffs/#independent-assessment-chats).

## Documentation cycle

Use this route to document existing behavior in a Brownfield project, including
creating missing guides. Start with a standalone Documenter assignment while no
cycle is active.

<!-- markdownlint-disable MD033 -->
<figure
  class="workflow-map workflow-map--cycle"
  aria-labelledby="documentation-cycle-caption"
>
  <div class="workflow-map__panel workflow-map__panel--standard">
    <p class="workflow-map__stage-label">Existing behavior · Brownfield only</p>
    <div class="workflow-map__gate">
      Invoke Documenter with a standalone documentation assignment
    </div>
    <div class="workflow-map__join workflow-map__join--stacked">
      <span aria-hidden="true">↓</span>
      Start with Auditor before documentation edits
    </div>
    <ol class="workflow-map__steps workflow-map__steps--vertical">
      <li>
        <a href="../../roles/auditor/">Auditor</a>
        <span class="workflow-map__detail">
          Establish existing behavior and project constraints
        </span>
      </li>
      <li>
        <a href="../../roles/scoper/">Scoper</a>
        <span class="workflow-map__detail">
          Define audiences, targets, boundaries, and outcomes
        </span>
      </li>
      <li>
        <a href="../../roles/architect/">Architect</a>
        <span class="workflow-map__detail">
          Establish existing technical contracts and coverage
        </span>
      </li>
      <li>
        <a href="../../roles/documenter/">Documenter</a>
        <span class="workflow-map__detail">Save documentation and checked evidence</span>
      </li>
      <li>
        <a href="../../roles/reviewer/">Final Reviewer</a>
        <span class="workflow-map__detail">
          Independently assess accuracy and acceptance coverage
        </span>
      </li>
      <li>
        <a href="../../roles/synchronizer/">Synchronizer</a>
        <span class="workflow-map__detail">
          Reconcile the current documents, assessments, and evidence
        </span>
      </li>
    </ol>
    <div class="workflow-map__finish">
      <div class="workflow-map__down" aria-hidden="true">↓</div>
      <div class="workflow-map__decision">Your sign-off decision</div>
    </div>
    <a class="workflow-map__guide" href="../updating-documentation/">
      Follow the documentation workflow
    </a>
  </div>
  <figcaption id="documentation-cycle-caption">
    You invoke each role explicitly. Final Reviewer needs a fresh, independent
    chat. All six roles must pass their full checks before your sign-off decision,
    including when the assessed documentation needs no changes.
  </figcaption>
</figure>
<!-- markdownlint-enable MD033 -->

This cycle covers prose, guides, project guidance outside managed blocks, and
ordinary comments or docstrings. It omits Development, Testing, and
implementation review. Required behavior, test, configuration, or tooling changes
need your decision about scope or a separate implementation cycle.

## Expedited cycle

Use expedited work for a clearly defined change in an existing project that
needs none of the skipped roles. The agent checks
[eligibility](../../concepts/project-modes/#choose-the-cycle-mode) before the
cycle starts.

<!-- markdownlint-disable MD033 -->
<figure
  class="workflow-map workflow-map--cycle"
  aria-labelledby="expedited-cycle-caption"
>
  <div class="workflow-map__panel workflow-map__panel--expedited">
    <p class="workflow-map__stage-label">Eligible existing projects · Brownfield</p>
    <div class="workflow-map__branches">
      <section class="workflow-map__branch" aria-labelledby="expedited-cycle-path">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">Normal path</span>
          <h3 id="expedited-cycle-path">Expedited work</h3>
        </div>
        <ol class="workflow-map__steps workflow-map__steps--vertical">
          <li>
            <a href="../working-with-developer/">Developer</a>
            <span class="workflow-map__detail">
              Approve the plan, then build and self-check
            </span>
          </li>
          <li>
            Implementation Reviewer
            <span class="workflow-map__detail">
              Review the change against your request and the evidence
            </span>
          </li>
        </ol>
        <div class="workflow-map__finish">
          <div class="workflow-map__down" aria-hidden="true">↓</div>
          <div class="workflow-map__decision">Your sign-off decision</div>
        </div>
        <a
          class="workflow-map__guide"
          href="../starting-a-cycle/#choose-a-cycle-mode-only-when-needed"
        >Start an expedited cycle</a>
      </section>
      <section
        class="workflow-map__branch workflow-map__branch--promotion"
        aria-labelledby="expedited-promotion-path"
      >
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">If a skipped role is needed</span>
          <h3 id="expedited-promotion-path">Switch to standard work</h3>
        </div>
        <p class="workflow-map__detail">
          The same cycle continues with its request and existing work.
        </p>
        <ol class="workflow-map__steps workflow-map__steps--vertical">
          <li>Auditor</li>
          <li>
            <a href="#standard-cycle">Follow the standard cycle</a>
            <span class="workflow-map__detail">Full deliverable by default</span>
          </li>
        </ol>
        <a
          class="workflow-map__guide"
          href="../working-with-developer/#continue-after-expedited-promotion"
        >Continue after promotion</a>
      </section>
    </div>
  </div>
  <figcaption id="expedited-cycle-caption">
    You invoke each role from its handoff. Reviewer needs an independent chat.
    Required checks and corrections must be complete before your sign-off decision.
  </figcaption>
</figure>
<!-- markdownlint-enable MD033 -->

Expedited work skips separate scoping, architecture, auditing, testing,
documentation, final review, and synchronization. Developer's self-checks do not
replace Tester's independent verification. This path is different from choosing
to
[finish a standard cycle after implementation review](../finishing-after-implementation-review/),
which keeps the earlier standard checks.

Switching an active expedited cycle to standard work is called
[promotion](../../concepts/states-and-handoffs/#promote-an-expedited-cycle). An
active role can promote when a skipped role is needed. At sign-off, it needs
your authorization; asking for rework that needs a skipped role also authorizes
the switch. Promotion is one-way for the cycle and preserves unfinished
corrections. Choosing the shorter standard finish is a separate decision.

## Implementation and testing

In standard work, choose whether Tester runs after all implementation or checks
testable outcomes along the way. Both options work for new and existing projects
and with either standard completion policy.

<!-- markdownlint-disable MD033 -->
<figure
  class="workflow-map workflow-map--cycle"
  aria-labelledby="implementation-testing-caption"
>
  <div class="workflow-map__panel workflow-map__panel--standard">
    <p class="workflow-map__stage-label">Standard work · Both completion policies</p>
    <div class="workflow-map__gate">Developer prepares the implementation plan</div>
    <div class="workflow-map__finish">
      <div class="workflow-map__down" aria-hidden="true">↓</div>
      <div class="workflow-map__decision">You approve the plan</div>
    </div>
    <a class="workflow-map__guide" href="../working-with-developer/#ask-for-a-plan">
      Review and approve the plan
    </a>
    <div class="workflow-map__join workflow-map__join--stacked">
      <span aria-hidden="true">↓</span> Choose when Tester runs
    </div>
    <div class="workflow-map__branches workflow-map__branches--centered">
      <section class="workflow-map__branch" aria-labelledby="test-after-path">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">Default</span>
          <h3 id="test-after-path">Test after implementation</h3>
        </div>
        <ol class="workflow-map__steps workflow-map__steps--vertical">
          <li>
            Developer
            <span class="workflow-map__detail">
              Finish all approved implementation and self-checks
            </span>
          </li>
        </ol>
        <a
          class="workflow-map__guide"
          href="../working-with-developer/#choose-when-tester-runs"
        >Choose when testing happens</a>
      </section>
      <section
        class="workflow-map__branch workflow-map__branch--incremental"
        aria-labelledby="test-increments-path"
      >
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">By your explicit choice</span>
          <h3 id="test-increments-path">Test in increments</h3>
        </div>
        <ol class="workflow-map__steps workflow-map__steps--vertical">
          <li>
            Developer
            <span class="workflow-map__detail">
              Build and self-check a testable outcome
            </span>
          </li>
          <li>
            Tester
            <span class="workflow-map__detail">
              Check that outcome and affected earlier behavior
            </span>
          </li>
        </ol>
        <p class="workflow-map__repeat">
          <span aria-hidden="true">↺</span> After a pass, return to Developer
        </p>
        <p class="workflow-map__detail">
          Developer checks the results. Repeat for remaining outcomes.
        </p>
        <a
          class="workflow-map__guide"
          href="../working-with-developer/#alternate-between-two-chats"
        >Alternate between Developer and Tester</a>
      </section>
    </div>
    <div class="workflow-map__join workflow-map__join--stacked">
      <span aria-hidden="true">↓</span>
      Once all implementation and Developer checks are complete
    </div>
    <ol class="workflow-map__steps workflow-map__steps--vertical">
      <li>
        Tester
        <span class="workflow-map__detail">Full verification of the final work</span>
      </li>
      <li>Implementation Reviewer</li>
    </ol>
    <a class="workflow-map__guide" href="#standard-cycle">
      Continue with your cycle's completion policy
    </a>
  </div>
  <figcaption id="implementation-testing-caption">
    Follow each handoff in the assigned role's chat. Tester works independently
    from Developer; Reviewer needs a fresh, independent chat. Passing increments
    does not replace full verification before implementation review.
  </figcaption>
</figure>
<!-- markdownlint-enable MD033 -->

When testing happens is separate from
[how you work with Developer](../working-with-developer/#choose-how-to-work-together).
Either path works with `AUTONOMOUS`, `STEPWISE`, or `CODE_WITH_ME`. Returning
from Tester keeps that mode's permissions and pauses; a passing checkpoint does
not grant more coding permission.

You can
[change when Tester runs](../working-with-developer/#switch-cadence-during-a-cycle)
during a cycle. Assigned testing and recovery finish their required route before
Developer applies the change. If a check finds a problem, follow the
[corrective handoff](../review-findings/) before continuing this flow. Expedited
work has no separate Tester phase; requesting incremental testing
[promotes it to standard work](../../concepts/states-and-handoffs/#promote-an-expedited-cycle).

## Change completion policy

For an active standard cycle, you can ask to use the full workflow or finish
after implementation review. The allowed route depends on the current step.
Changing the policy does not accept the work or remove any requirement.

<!-- markdownlint-disable MD033 -->
<figure
  class="workflow-map workflow-map--cycle"
  aria-labelledby="policy-change-caption"
>
  <div class="workflow-map__panel workflow-map__panel--standard">
    <p class="workflow-map__stage-label">Active standard cycle · Your explicit choice</p>
    <div class="workflow-map__decision">Ask to change the completion policy</div>
    <div class="workflow-map__join workflow-map__join--stacked">
      <span aria-hidden="true">↓</span> First, check whether a change is allowed
    </div>
    <div class="workflow-map__gate">
      Recovery and outstanding corrections are finished. Normal documentation,
      final review, and synchronization have not started.
    </div>
    <div class="workflow-map__join workflow-map__join--stacked">
      <span aria-hidden="true">↓</span> Follow the route for the current step
    </div>
    <section class="workflow-map__branch" aria-labelledby="early-policy-change">
      <div class="workflow-map__branch-heading">
        <span class="workflow-map__eyebrow">At an earlier workflow step</span>
        <h3 id="early-policy-change">Change either way</h3>
      </div>
      <p class="workflow-map__detail">
        At Scoper, Architect, Auditor, Developer, Tester, or implementation Reviewer
      </p>
      <ol class="workflow-map__steps workflow-map__steps--vertical">
        <li>Choose the full workflow or the shorter finish</li>
        <li>
          Keep the current role's assignment
          <span class="workflow-map__detail">
            Checkpoints and blockers stay in place
          </span>
        </li>
      </ol>
      <a
        class="workflow-map__guide"
        href="../finishing-after-implementation-review/#make-the-choice"
      >Change the policy during earlier work</a>
    </section>
    <div class="workflow-map__join">Two later opportunities</div>
    <p class="workflow-map__detail">
      Both need a passing implementation review and full verification that still
      apply, with no blocking question.
    </p>
    <div class="workflow-map__branches workflow-map__branches--centered">
      <section
        class="workflow-map__branch workflow-map__branch--short"
        aria-labelledby="late-shorter-finish"
      >
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">At the Documenter handoff</span>
          <h3 id="late-shorter-finish">Choose the shorter finish</h3>
        </div>
        <p class="workflow-map__detail">
          Before Documenter starts its normal work, ask to finish after
          implementation review.
        </p>
        <ol class="workflow-map__steps workflow-map__steps--vertical">
          <li>
            Implementation Reviewer
            <span class="workflow-map__detail">
              Assess whether the cycle can finish under the shorter policy
            </span>
          </li>
        </ol>
        <p class="workflow-map__detail">
          Only after Reviewer confirms that no required work remains:
        </p>
        <div class="workflow-map__finish">
          <div class="workflow-map__down" aria-hidden="true">↓</div>
          <div class="workflow-map__decision">Your sign-off decision</div>
        </div>
        <a
          class="workflow-map__guide"
          href="../finishing-after-implementation-review/#what-reviewer-must-check"
        >Check whether the cycle can finish</a>
      </section>
      <section class="workflow-map__branch" aria-labelledby="return-full-workflow">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">
            Awaiting sign-off on the shorter finish
          </span>
          <h3 id="return-full-workflow">Return to the full workflow</h3>
        </div>
        <p class="workflow-map__detail">
          Ask for the full workflow. Earlier work that still applies does not
          need to repeat.
        </p>
        <ol class="workflow-map__steps workflow-map__steps--vertical">
          <li>Documenter</li><li>Final Reviewer</li><li>Synchronizer</li>
        </ol>
        <div class="workflow-map__finish">
          <div class="workflow-map__down" aria-hidden="true">↓</div>
          <div class="workflow-map__decision">Your sign-off decision</div>
        </div>
        <a
          class="workflow-map__guide"
          href="../finishing-after-implementation-review/#return-to-the-full-workflow"
        >Return to the full workflow</a>
      </section>
    </div>
  </div>
  <figcaption id="policy-change-caption">
    If the conditions are not met, the policy stays unchanged; the request is not
    saved to apply later. A policy change does not run a role. Follow the handoff
    and use an independent Reviewer chat when review is next.
  </figcaption>
</figure>
<!-- markdownlint-enable MD033 -->

After returning to the full workflow, you can choose the shorter finish again
before Documenter starts its normal work. Reviewer must reassess it; an earlier
eligible result is not enough. Corrective work by Documenter or Synchronizer
does not count as starting their normal phases, but any required corrections
must still be finished. Changed work follows its
[recovery route](../../concepts/recovery/) before a change that needs current
review evidence.

Ask a workflow role outside Navigator to make the change. Repeating the current
policy leaves the state and records unchanged. For a new cycle, include your
choice
[with the request](../starting-a-cycle/#choose-when-the-cycle-can-finish); it
does not carry over from the previous cycle. Finished cycles stay closed, and a
policy request alone does not promote expedited work.

## Rework and recovery

You can request a change during an active cycle, including while awaiting
sign-off. An agent can also find a problem that needs correcting. Both routes
keep the same cycle and send the work to the role responsible for it.

<!-- markdownlint-disable MD033 -->
<figure
  class="workflow-map workflow-map--cycle"
  aria-labelledby="rework-recovery-caption"
>
  <div class="workflow-map__panel workflow-map__panel--standard">
    <p class="workflow-map__stage-label">Standard work · Both completion policies</p>
    <div class="workflow-map__branches workflow-map__branches--centered">
      <section class="workflow-map__branch" aria-labelledby="user-rework-start">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">Your request</span>
          <h3 id="user-rework-start">Change the work</h3>
        </div>
        <p class="workflow-map__detail">
          Tell the current agent what you want to be different.
        </p>
        <a class="workflow-map__guide" href="../revising-scope-or-design/">
          Request a change
        </a>
      </section>
      <section class="workflow-map__branch" aria-labelledby="problem-recovery-start">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">A problem is found</span>
          <h3 id="problem-recovery-start">Correct the work</h3>
        </div>
        <p class="workflow-map__detail">
          The agent records the problem and identifies who owns the fix.
        </p>
        <a class="workflow-map__guide" href="../review-findings/">
          Handle review findings
        </a>
      </section>
    </div>
    <div class="workflow-map__join workflow-map__join--stacked">
      <span aria-hidden="true">↓</span>
      If the correction belongs at another workflow step
    </div>
    <ol class="workflow-map__steps workflow-map__steps--vertical">
      <li>
        Save the correction and where to return
        <span class="workflow-map__detail">
          The agent gives you the responsible role's invocation
        </span>
      </li>
      <li>
        The responsible role corrects and checks its work
        <span class="workflow-map__detail">
          It decides which affected work, if any, must run again
        </span>
      </li>
    </ol>
    <div class="workflow-map__join workflow-map__join--stacked">
      <span aria-hidden="true">↓</span> Does other work need to repeat?
    </div>
    <div class="workflow-map__branches workflow-map__branches--centered">
      <section class="workflow-map__branch" aria-labelledby="recovery-no-rerun">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">No</span>
          <h3 id="recovery-no-rerun">Return directly</h3>
        </div>
        <p class="workflow-map__detail">
          The correction is complete. No other work needs to run again before
          returning.
        </p>
      </section>
      <section class="workflow-map__branch" aria-labelledby="recovery-rerun">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">Yes</span>
          <h3 id="recovery-rerun">Repeat affected work</h3>
        </div>
        <p class="workflow-map__detail">
          Follow the saved handoffs through the affected roles. Each repeats its
          required work and checks before returning.
        </p>
        <a
          class="workflow-map__guide"
          href="../../concepts/recovery/#correct-then-decide-what-to-repeat"
        >See how reruns are chosen</a>
      </section>
    </div>
    <div class="workflow-map__join workflow-map__join--stacked">
      <span aria-hidden="true">↓</span> After the correction and any required reruns
    </div>
    <div class="workflow-map__gate">
      Return to the saved step: resume its work or recheck sign-off readiness
    </div>
    <a
      class="workflow-map__guide"
      href="../../concepts/recovery/#remember-where-to-return"
    >Follow the saved return route</a>
  </div>
  <figcaption id="rework-recovery-caption">
    You invoke each role from its handoff; the agents save the route. A correction
    within the current step stays there without adding a return route. Finishing
    recovery does not itself make the cycle ready for sign-off.
  </figcaption>
</figure>
<!-- markdownlint-enable MD033 -->

If another correction interrupts recovery, the agent keeps the earlier work and
return instructions. It handles the newest correction first, then returns to the
earlier one. Reviewer reassesses its findings when review resumes; another role
cannot close them on Reviewer's behalf.

Reruns depend on affected work already produced, including implementation and
test evidence from unfinished phases. Future work alone does not need a rerun. A
[specific correction can return before unrelated work is finished](../../concepts/recovery/#when-a-correction-must-return-before-full-completion),
but standard work still needs full Developer and Tester completion before
returning to Reviewer. Material changes to Developer's approved plan need your
approval before coding.

The shorter completion policy stays in place during recovery. Required fixes can
still go to Documenter, final Reviewer, or Synchronizer without starting their
normal phases. If a correction affects the shorter finish's evidence,
implementation Reviewer must reassess it before sign-off readiness. See
[corrections under the shorter policy](../../concepts/recovery/#corrections-when-finishing-after-implementation-review).

In expedited work, corrections stay with Developer or implementation Reviewer.
If a skipped role is needed, the cycle
[becomes standard work](#expedited-cycle), starting with Auditor. Unfinished
corrections are preserved when the route changes.

## Resume interrupted work

Continue from the project checkout that contains the saved STANDARDS files and
the work done so far. A new chat does not start a new cycle. You do not need to
rebuild the workflow from chat history or edit the state files.

<!-- markdownlint-disable MD033 -->
<figure
  class="workflow-map workflow-map--cycle"
  aria-labelledby="resume-work-caption"
>
  <div class="workflow-map__panel workflow-map__panel--standard">
    <p class="workflow-map__stage-label">
      Standard, expedited, or documentation · Saved active cycle
    </p>
    <ol class="workflow-map__steps workflow-map__steps--vertical">
      <li>
        Open the checkout with the saved work
        <span class="workflow-map__detail">
          Keep the STANDARDS files and project changes together
        </span>
      </li>
      <li>
        Follow the latest handoff
        <span class="workflow-map__detail">
          If role work is next, invoke the role named in the handoff
        </span>
      </li>
      <li>
        The agent checks the saved state against the current files
        <span class="workflow-map__detail">
          Read the request, approvals, reports, blockers, and recovery instructions
        </span>
      </li>
    </ol>
    <a
      class="workflow-map__guide"
      href="../resuming-work/#invoke-the-role-named-by-the-handoff"
    >Resume from the handoff</a>
    <div class="workflow-map__join workflow-map__join--stacked">
      <span aria-hidden="true">↓</span> Follow what the saved work needs next
    </div>
    <div class="workflow-map__branches workflow-map__branches--centered">
      <section class="workflow-map__branch" aria-labelledby="resume-assignment">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">Work can proceed</span>
          <h3 id="resume-assignment">Continue the assigned work</h3>
        </div>
        <div class="workflow-map__gate">
          Resume the role's task, checkpoint, or correction
        </div>
        <p class="workflow-map__detail">
          Check which earlier results still apply. Follow any saved recovery route
          before returning to the normal workflow.
        </p>
        <a
          class="workflow-map__guide"
          href="../resuming-work/#what-each-role-does-when-it-resumes"
        >See how each role resumes</a>
      </section>
      <section class="workflow-map__branch" aria-labelledby="resume-decision">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">Waiting for you</span>
          <h3 id="resume-decision">Respond to the pending decision</h3>
        </div>
        <div class="workflow-map__decision">Your answer or approval</div>
        <p class="workflow-map__detail">
          Answer the saved question, review a proposed plan, or decide whether to
          sign off. The agent records your decision and the next step.
        </p>
        <a
          class="workflow-map__guide"
          href="../resuming-work/#answer-decisions-that-are-waiting-on-you"
        >Handle a pending decision</a>
      </section>
    </div>
  </div>
  <figcaption id="resume-work-caption">
    Resuming does not approve a plan, clear a blocker, or accept the work. Changed
    files may need new checks or corrections before the assignment can continue.
  </figcaption>
</figure>
<!-- markdownlint-enable MD033 -->

If you do not know which role is next, ask the agent to explain the saved state
first. [Navigator](../../roles/navigator/) can help you understand the project,
but cannot advance the workflow. Use an
[independent assessment chat](../resuming-work/#keep-independent-assessments-separate)
for Tester or Reviewer; each can resume its own eligible chat.

Developer keeps the saved collaboration mode and user style. An unchanged
approved plan does not need another approval; a material revision does. The
[resume guide](../resuming-work/#what-each-role-does-when-it-resumes) explains
which roles reload a saved user style and when to name it again.

At sign-off, review the current work and choose whether to accept it, request
changes, or cancel. A shorter standard cycle can also
[return to the full workflow](#change-completion-policy). After sign-off or
retained cancellation, a new request
[starts a new cycle](../cancelling-and-new-cycles/#start-the-next-cycle) instead
of reopening the old one. If you changed branches or computers, bring the saved
files and project changes with you; see
[working on more than one branch](../resuming-work/#work-on-more-than-one-branch).

## End a cycle and start another

You can accept work when it is ready for sign-off, or ask to cancel an active
cycle. Cancellation does not undo project changes. The next request starts a new
cycle; it does not reopen the old one.

<!-- markdownlint-disable MD033 -->
<figure
  class="workflow-map workflow-map--cycle"
  aria-labelledby="end-start-cycle-caption"
>
  <div class="workflow-map__panel workflow-map__panel--standard">
    <p class="workflow-map__stage-label">End the active cycle</p>
    <div class="workflow-map__branches workflow-map__branches--centered">
      <section class="workflow-map__branch" aria-labelledby="end-cycle-signoff">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">Ready for sign-off</span>
          <h3 id="end-cycle-signoff">Accept the work</h3>
        </div>
        <div class="workflow-map__decision">You ask to sign off</div>
        <div class="workflow-map__down" aria-hidden="true">↓</div>
        <ol class="workflow-map__steps workflow-map__steps--vertical">
          <li>Recheck that completion evidence still applies</li>
          <li>Cycle signed off · Record kept</li>
        </ol>
        <a
          class="workflow-map__guide"
          href="../../concepts/human-decisions/#decide-at-sign-off"
        >Make your sign-off decision</a>
      </section>
      <section class="workflow-map__branch" aria-labelledby="end-cycle-cancel">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">Existing implementation</span>
          <h3 id="end-cycle-cancel">Cancel and keep the record</h3>
        </div>
        <p class="workflow-map__detail">
          For an existing project, or a new project that has gained implementation.
        </p>
        <div class="workflow-map__decision">You ask to cancel</div>
        <div class="workflow-map__down" aria-hidden="true">↓</div>
        <div class="workflow-map__gate">Cycle cancelled · Record kept</div>
        <p class="workflow-map__detail">Project changes remain in place.</p>
        <a
          class="workflow-map__guide"
          href="../cancelling-and-new-cycles/#what-happens-when-you-cancel"
        >Cancel an active cycle</a>
      </section>
    </div>
    <div class="workflow-map__join">
      A different cancellation route when greenfield work has no implementation
    </div>
    <section class="workflow-map__branch" aria-labelledby="end-cycle-reset">
      <div class="workflow-map__branch-heading">
        <span class="workflow-map__eyebrow">Greenfield · No implementation created</span>
        <h3 id="end-cycle-reset">Preview and approve a reset</h3>
      </div>
      <p class="workflow-map__detail">
        After your cancellation request, the agent checks that no implementation
        exists and previews the reset, including which workflow records it deletes.
      </p>
      <div class="workflow-map__finish">
        <div class="workflow-map__down" aria-hidden="true">↓</div>
        <div class="workflow-map__decision">You approve the exact reset command</div>
      </div>
      <div class="workflow-map__down" aria-hidden="true">↓</div>
      <div class="workflow-map__gate">
        The reset succeeds · Fresh greenfield state, with STANDARDS still installed
      </div>
      <p class="workflow-map__detail">
        Until approval and a successful reset, cancellation is not complete.
      </p>
      <a
        class="workflow-map__guide"
        href="../cancelling-and-new-cycles/#what-happens-when-you-cancel"
      >Review the reset and what it removes</a>
    </section>
    <div class="workflow-map__join workflow-map__join--stacked">
      <span aria-hidden="true">↓</span>
      After sign-off, retained cancellation, or a successful reset
    </div>
    <div class="workflow-map__decision">Give your next request</div>
    <div class="workflow-map__join workflow-map__join--stacked">
      <span aria-hidden="true">↓</span>
      Check the project mode and any work left by cancelled cycles
    </div>
    <div class="workflow-map__branches workflow-map__branches--centered">
      <section class="workflow-map__branch" aria-labelledby="next-cycle-audit">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">Cancelled work remains or is uncertain</span>
          <h3 id="next-cycle-audit">Start with Auditor</h3>
        </div>
        <div class="workflow-map__gate">Standard or eligible documentation work</div>
        <p class="workflow-map__detail">
          Auditor establishes which changes belong in the project's baseline.
          Earlier unresolved cancellations still count.
        </p>
        <a
          class="workflow-map__guide"
          href="../cancelling-and-new-cycles/#start-the-next-cycle"
        >Start after a retained cancellation</a>
      </section>
      <section class="workflow-map__branch" aria-labelledby="next-cycle-entry">
        <div class="workflow-map__branch-heading">
          <span class="workflow-map__eyebrow">No unresolved cancelled work</span>
          <h3 id="next-cycle-entry">Use the eligible starting role</h3>
        </div>
        <p class="workflow-map__detail">
          For standard work, Scoper starts a new project; Auditor starts work in
          an existing project. Developer starts an eligible expedited change.
          A standalone Documenter assignment starts the documentation route with
          Auditor.
        </p>
        <a class="workflow-map__guide" href="../starting-a-cycle/">
          Choose how to start the next cycle
        </a>
      </section>
    </div>
    <div class="workflow-map__join workflow-map__join--stacked">
      <span aria-hidden="true">↓</span> Once the request and mode are allowed
    </div>
    <div class="workflow-map__gate">
      The agent starts a new cycle with a new ID and the policy for this request
    </div>
  </div>
  <figcaption id="end-start-cycle-caption">
    Give the new request to its starting role; the agent checks eligibility and
    sets up the cycle. If the chosen mode cannot handle it, the agent saves the
    request and asks you to resolve the choice before starting.
  </figcaption>
</figure>
<!-- markdownlint-enable MD033 -->

Sign-off checks the current mode and completion policy. If the evidence no
longer applies, the work follows [recovery](#rework-and-recovery) before it can
be accepted. Asking for changes at sign-off is rework within the active cycle,
rather than a request to start another.

A greenfield reset removes the saved workflow state, Auditor context, and all
cycle records under `.standards/docs/`. It leaves no cancelled cycle record.
Project files outside `.standards/`, installed skills, hooks, client settings,
and user styles remain. Asking to cancel alone does not approve this reset. If
you decline or the reset fails, the cycle has not ended. See the
[cancellation guide](../cancelling-and-new-cycles/#what-happens-when-you-cancel)
for the full procedure.

Each new standard cycle defaults to the full workflow. To use the shorter
finish,
[include that choice in the new request](../starting-a-cycle/#choose-when-the-cycle-can-finish).
The earlier cycle's policy does not carry over. After a successful greenfield
reset, the next request starts the first cycle from the fresh state.
