---
title: Frequently Asked Questions
description: Short answers to common questions about using STANDARDS.
---

Short answers to questions people often ask. Each answer links to the page with
the full details (where applicable).

## Deciding whether to use STANDARDS

### Which coding agents does STANDARDS support?

Codex and Claude Code. The installer can set up either one or both, and you can
add the other later by running the installer again. Other coding agents are not
supported. See
[Installation and Setup](../getting-started/installation/#choose-a-project-mode-and-coding-agent).

### What kinds of projects does it work with?

Most software projects: applications, services, libraries, frameworks,
command-line tools, infrastructure, and similar work. It isn't tied to one
language. Some roles include extra style guidance for Python, TypeScript, React,
Next.js, SQL, HTML, and CSS, and their general guidance applies to everything
else.

The workflow tools run on Node.js, so you need Node.js 22.12 or newer even if
your project doesn't use JavaScript.

### Is it overkill for small changes?

It doesn't have to be. For a small, clearly defined change to an existing
project, give your request to Developer to use **expedited** work. It runs only
Developer and an independent implementation Reviewer before you decide whether
to accept the change. Developer still shows you a plan and waits for your
approval before coding.

Expedited work skips the separate requirements, design, project audit, testing,
documentation, and final-check steps, so use it only when the change doesn't
need them. If it turns out to need one, the cycle switches to the full standard
workflow. New projects always use standard work. See
[Project and Cycle Modes](../concepts/project-modes/#choose-the-cycle-mode).

If you only want to understand something in the project, use
[Navigator](../roles/navigator/). It answers questions without changing any
files or starting a cycle.

### Does STANDARDS use more agent time or tokens?

Yes, noticeably more than asking an agent to make the change directly. That is
the trade-off: each role works in its own session, checks its work, and saves it
so the next role can check it independently. A standard cycle has nine of these
steps, and an expedited cycle has two.

To measure the difference, we made the same changes with and without STANDARDS,
using Claude Opus 5.5 in Claude Code, on two projects: a small command-line tool
(about 80 lines of code and 6 tests) and the Commander.js library (about 4,200
lines of code and 1,373 tests). We counted **new tokens**: the input the model
hadn't already seen earlier in the same session. Most of what an agent sends at
each step is context it already has, which is re-read from cache at a much lower
price, so new tokens reflect the actual work better than the raw total.

| Change                               | Without STANDARDS | With STANDARDS                     | Ratio     |
| ------------------------------------ | ----------------- | ---------------------------------- | --------- |
| Small tool: add a `--json` option    | about 60,000      | about 1.1 million (standard cycle) | about 19× |
| Small tool: fix a one-word typo      | about 50,000      | about 270,000 (expedited cycle)    | about 5×  |
| Commander.js: add deprecated options | about 125,000     | about 1.5 million (standard cycle) | about 12× |

Counting cached re-reads too, the ratios were about 45, 20, and 18 times. Time
grew about as much as new tokens: on Commander.js, the standard cycle's nine
sessions took about 80 minutes of agent time, against about 6.5 minutes for a
single session.

The ratio shrinks as the change grows because part of the cost is fixed. Every
workflow role first reads the full workflow rules and its own instructions,
about 40,000 to 50,000 new tokens whatever the size of the change. That was
about a third of the standard cycle's new tokens on the small tool and about a
quarter on Commander.js.

The extra tokens buy more than code. Each standard cycle produced written
requirements, a design, independently written tests, two independent reviews,
and a final consistency check. On Commander.js, Scoper also asked about three
points the request left open. The two single sessions had settled one of them in
opposite ways without asking. On the small tool, the reviews found an existing
bug that the single sessions didn't mention.

Don't expect fewer bugs on every change, though. The Commander.js request was
detailed, and the single sessions got it right: all three versions passed the
same 25 hidden checks, and a blind code review found the core behavior correct
in all three. The reviewer actually preferred one of the single-session
versions. For a clear, well-defined change like this one, the benefit was mostly
settled questions and a written record rather than fewer bugs.

New tokens by role:

| Role                     | Small tool            | Commander.js  |
| ------------------------ | --------------------- | ------------- |
| Navigator (one question) | about 45,000          | not measured  |
| Scoper                   | about 85,000          | about 125,000 |
| Architect                | about 85,000          | about 160,000 |
| Auditor                  | about 110,000         | about 190,000 |
| Developer                | about 105,000–120,000 | about 160,000 |
| Reviewer                 | about 85,000–125,000  | about 160,000 |
| Documenter               | about 115,000         | about 155,000 |
| Synchronizer             | about 120,000         | about 155,000 |
| Tester                   | about 265,000         | about 235,000 |
| Sign-off (no role)       | about 65,000          | not measured  |

On the small tool, the Developer and Reviewer ranges cover both the feature and
the typo fix. Each figure comes from one run, and your coding agent, model, and
project will change them.

To keep usage down:

- Use expedited work for small, clearly defined changes to an existing project.
- Use Navigator for questions. It doesn't read the full workflow rules.
- Keep each cycle to one focused change.
- Use lower-tier models for roles that don't need the highest capability.

### Does STANDARDS send my code or data anywhere?

No. When you run the installer or another STANDARDS command with `npx`, it
downloads the STANDARDS package from npm. Everything else runs on your machine.
The tools in `.standards/bin/` use only Node.js and git, and they don't connect
to the internet. STANDARDS collects no telemetry.

Your coding agent works as it always does: it still sends your prompts and the
files it reads to its provider. STANDARDS doesn't change that.

## How the workflow works

### Why do I have to start each role myself?

So you stay in control of when each step happens and where it runs. When a role
finishes, it saves its work and gives you the command for the next role. You
decide when to run it and in which chat. That matters for Tester and Reviewer,
which need a fresh chat that only you can open.

The saved workflow state decides which role is allowed to work next, but it
never starts a role on its own. The installer also turns off automatic skill use
in both coding agents, so a role runs only when you call it. See
[Human Decisions and Sign-off](../concepts/human-decisions/#run-each-role-explicitly).

### Why can't a role just fix a problem it finds?

Each role owns certain decisions, and a fix belongs to the role that owns the
thing that's wrong. Suppose Tester finds that the design never says when a
failed request should be retried. Tester can't settle that by writing a test.
Architect makes the decision, and then testing continues.

This keeps a fix from quietly changing your requirements or design. The agent
works out who owns the problem, records it, and gives you the command for that
role. See
[Roles and Ownership](../concepts/ownership/#send-problems-to-their-owners).

### Why do Tester and Reviewer need a fresh chat? Should I switch models?

A check is only useful if it isn't shaped by the reasoning that produced the
work. Tester runs in a chat separate from Developer's implementation chat.
Reviewer runs in a chat separate from every chat that produced the work under
review: the requirements, design, project context, code, tests, and
documentation. Both work from the saved files and evidence, not from what the
author said.

For Reviewer, a different model of equal or higher capability is recommended
when you can choose one, but it's optional. The separate chat is required either
way. See
[Independent assessment chats](../concepts/states-and-handoffs/#independent-assessment-chats).

### Can I skip a role?

Not one at a time. Expedited work leaves out a fixed set of roles for small
changes to an existing project, and you can't pick and choose beyond that. A
skipped role's job also doesn't move to another role. For example, Developer's
own checks don't replace Tester's verification.

If expedited work turns out to need a skipped role, the cycle is promoted to
standard work and continues from Auditor. See
[Promote an expedited cycle](../concepts/states-and-handoffs/#promote-an-expedited-cycle).

### What does sign-off mean? Is my work merged or deployed?

Sign-off means you accept the finished work, and it ends the cycle. It doesn't
commit, merge, push, or deploy anything. Those stay your decisions.

You're asked to decide only after the required checks are complete, and when you
sign off, the agent confirms that they still hold for the current files. You can
also ask for changes or cancel instead. See
[Decide at sign-off](../concepts/human-decisions/#decide-at-sign-off).

### How do I know every requirement was actually checked?

In standard work, Scoper writes each outcome that must be true as an
**acceptance condition** with an ID, such as `AC-001`. The design, the
implementation plan, and every assessment report refer to the same IDs. Tester
records the evidence for each one, or why it can't be verified yet. Final review
checks that every condition has enough evidence, and Synchronizer checks that
the evidence still matches the files you're signing off.

The workflow check also flags a finished report that leaves out a current ID. It
can't judge whether the evidence is good; that's the job of Tester and Reviewer.
Expedited work has no IDs and is checked against your saved request instead. See
[Acceptance Criteria and Traceability](../concepts/acceptance-traceability/).

## Customizing

### Can I make a role follow my own preferences?

Yes, with a **user style**: a Markdown file with your preferences for one role,
such as how you like test names or docstrings written. Save it at
`.standards/user-styles/<role>/<name>.md` and name it when you invoke the role,
for example `$developer Use user style tony.` (`/developer` in Claude Code). A
role never picks a style on its own.

A style covers choices the role would otherwise make itself. It can't override
the workflow rules, your project's instructions or tooling, the agreed
requirements and design, or correctness. Developer, Tester, Reviewer,
Documenter, and Synchronizer save your choice and reload it when they resume;
Developer keeps the same style for the whole cycle once you approve its plan.
With Scoper, Architect, Auditor, and Navigator, name the style again in each new
chat. See [User styles](../reference/runtime-files/#user-styles).

### Can I add, remove, or rename a role?

No. The nine roles are built into STANDARDS, and the rules for passing work
between them depend on every one of them. Adding, removing, or renaming a role
is a change to STANDARDS itself and comes only in a new **major** version.

You can add your own separate skills next to the STANDARDS roles; the installer
and uninstaller leave them alone. To change how a role works for you, use a user
style.

## Day-to-day use

### How big should one cycle be?

A cycle is one request, from the moment you give it to your sign-off or
cancellation. A good size is a change you'd want to accept or reject as a whole,
such as one feature or one fix. Each cycle gets its own requirements, reviews,
and sign-off, so unrelated changes are easier to judge in separate cycles.

For a large project, work through several cycles, one after another. For a
small, clearly defined fix to an existing project, consider expedited work. Each
branch holds one active cycle at a time.

### Which role do I run next?

The one named in the last handoff. When a role finishes, it gives you a command
to copy and paste, such as
`$architect Continue the active workflow from .standards/STATE.md.`

If you've lost it, ask the agent, or Navigator, which step the workflow is on.
If you run the wrong role, it checks the saved state, leaves the work alone, and
tells you which role owns the current step. See
[Resuming Interrupted Work](../guides/resuming-work/).

### I closed the chat partway through. Is my work lost?

No. Roles save their progress to files in your project as they work, not just at
the end. Open a new chat and run the role named in the last handoff. It picks up
from the saved state and its own records, so you don't need to repeat your
request or explain what happened.

If you're switching devices, commit and push the work first so the saved files
come with you. Tester and Reviewer should resume in their own assessment chat or
a new one, never in Developer's chat. See
[Resuming Interrupted Work](../guides/resuming-work/).

### A role asked me a question and I left. What happens?

The role saves the question in `.standards/STATE.md` before asking it, and the
workflow waits at that step. When you come back and run the role again, it sees
the saved question and asks you again. Once you answer, it carries on. See
[Answer decisions that are waiting on you](../guides/resuming-work/#answer-decisions-that-are-waiting-on-you).

### Can I use my own requirements or design document?

Yes. Tell Scoper or Architect where it is, and it can update your document
instead of creating a new one. The document stays yours: STANDARDS doesn't mark
it as a workflow file, and reset and uninstall leave it in place.

Expect a few changes to it. Scoper writes each requirement as a list item that
starts with its ID, such as `- AC-001: Users can search by name.` When a later
cycle reuses the document, the earlier cycle's items move under a "Previous
Cycles" heading at the end, so an ID never changes meaning. See
[Scoper](../roles/scoper/#inputs-and-output) and
[Architect](../roles/architect/#inputs-and-output).

### Can I change my mind partway through?

Yes. Tell the agent you're working with what you want to be different, even if a
later role is active or the work is waiting for your sign-off. You don't need to
edit any documents or work out who is responsible. The agent records the change,
sends it to the role that owns that decision, and gives you the command to run
next.

After the change is made, that role decides which later steps need to run again,
and the workflow returns to where it was interrupted. In expedited work, a
change that needs a skipped role moves the cycle to standard work. See
[Revising Scope or Design](../guides/revising-scope-or-design/).

### Does the agent commit my changes?

Not unless you ask. When a role finishes a meaningful set of changes, it
suggests a commit message in the Conventional Commits format, such as
`feat(search): add search by name`. You decide when and what to commit.
Navigator never suggests one, because it doesn't change anything.

### What does the stop hook do? Can I turn it off?

When the agent finishes a turn and there are uncommitted changes in
`.standards/` or in Markdown files, the hook runs the workflow check. If the
check finds problems, it sends the agent back once to fix them, pass them to the
right role, or tell you. The check catches mistakes such as a malformed record
or a requirement that a finished report left out. It doesn't judge the quality
of the work.

The installer adds the hook unless you say no. To turn it off later, run the
installer again with `--no-hooks`; `--hooks` turns it back on. Codex runs the
hook only after you trust it by running `/hooks` in Codex. See
[Hooks](../getting-started/installation/#hooks).

### How do I stop, start over, upgrade, or remove STANDARDS? What does each delete?

| To                          | Do this                    | It deletes                                                                                                                                                                                          | It keeps                                                                             |
| --------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Stop the current cycle      | Ask the agent to cancel it | Nothing. The cycle is recorded as cancelled.                                                                                                                                                        | Everything, including the cycle's records.                                           |
| Start the workflow over     | Reset                      | The saved workflow state, the Auditor's project context, and every cycle record in `.standards/docs/`.                                                                                              | STANDARDS itself: the protocol, tools, skills, hook, settings, and your user styles. |
| Get a newer release         | Reinstall                  | Nothing. It updates STANDARDS's own files: the protocol, tools, skills, and its sections of `AGENTS.md` and `CLAUDE.md`.                                                                            | Workflow state, project context, cycle records, user styles, and the project mode.   |
| Remove STANDARDS completely | Uninstall                  | All of `.standards/`, including workflow state, cycle records, and user styles; the role skills; the STANDARDS sections of `AGENTS.md` and `CLAUDE.md`; the hook; and settings the installer added. | Your project files, and any installer-added settings you have since changed.         |

In a new project where the cycle hasn't created any implementation yet,
cancelling runs a reset instead, after you approve it.

None of these undo changes to your code, tests, or documentation. Reverting
those is up to you.

The commands are:

```sh
npx @idinsight/standards@<version> reset    # <version> is in .standards/VERSION.json
npx @idinsight/standards@latest install
npx @idinsight/standards@latest uninstall
```

Add `--dry-run` to reset or uninstall to preview the changes without making
them. Moving to a new major version means uninstalling and installing again. See
[Installation and Setup](../getting-started/installation/#reinstall-or-upgrade)
and [Cancelling or Starting a New Cycle](../guides/cancelling-and-new-cycles/).

## Files, git, and teams

### Should I commit `.standards/`?

Yes. Commit it like any other project files, along with everything else the
installer added: `AGENTS.md`, `CLAUDE.md`, the role skills in `.agents/skills/`
or `.claude/skills/`, `.claude/settings.json`, and `.codex/hooks.json`. Without
the role skills in the repository, a teammate's copy has no roles to run, and
the installer stops rather than guess what is missing. The saved workflow state
lives in `.standards/`, so committing it lets anyone who checks out the branch,
including you on another device, continue where the work left off. See
[Branches and merges](../reference/runtime-files/#branches-and-merges).

### Can my team use it together, or run more than one cycle at a time?

Yes, one cycle per branch. Each branch carries at most one active cycle, so
teammates on different branches can each run their own. Anyone who checks out a
branch continues its cycle from the saved state, so a teammate can pick up your
work. A teammate who didn't write the work can also run Tester or Reviewer in
their own chat.

You can't run two cycles on the same branch at once. Before merging a branch
into your main branch, reset it, as the next question explains.

### What do I do with `.standards/` when I merge a branch?

Finish or cancel the branch's cycle, reset the branch, commit the result, and
then merge. The main branch then keeps a clean installation with no cycle in
progress, and every new branch starts fresh. Reset deletes the branch's workflow
state, project context, and cycle records.

If you merge two branches that both changed `.standards/` without resetting, git
will usually report a conflict in `.standards/STATE.md`. Resolve it by keeping
exactly one cycle. Agents will stop and ask you to resolve conflicts in
`.standards/` rather than picking a "best" merge solution. See
[Branches and merges](../reference/runtime-files/#branches-and-merges).

### Can I edit `STATE.md` or the workflow records by hand?

It isn't supported, except to resolve a merge conflict. The agents update
`.standards/STATE.md`, `.standards/MODE.md`, and the cycle records in
`.standards/docs/` as they work, and you shouldn't need to touch them. To change
the work, tell the agent what you want instead. If you edit them anyway, you're
responsible for the result. The workflow check catches many of the problems hand
edits cause, but not all of them.

Your user styles are the exception: they're yours to write and edit.

### Does it work without git?

Yes, but git is recommended. Without it, the workflow check skips the
comparisons it makes against your last commit, such as spotting a requirement ID
that was deleted instead of retired. The stop hook also can't tell whether
workflow files changed, so it runs the check at the end of every turn. Roles
that assess changes, such as Reviewer, also have less to go on when working out
exactly what changed.
