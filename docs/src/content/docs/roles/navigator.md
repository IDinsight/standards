---
title: Navigator
description:
  Explain, investigate, and check understanding without changing files.
---

Navigator helps you understand existing work. It explains behavior in plain
language, investigates questions using repository evidence, and checks your
understanding through adaptive questions. It never changes project files or
workflow state.

## When to use Navigator

Use it for orientation, tracing an input through the code, understanding a
change, exploring “what happens if,” or interpreting saved workflow status.
These capabilities work within any mode; they are not separate modes.

You can invoke Navigator in any state, including sign-off, terminal states, or
an expedited cycle. Ordinary explanation does not require an active cycle or
complete installed metadata. If metadata is missing, Navigator limits its
workflow-status claims and continues with available project evidence.

## Inputs and output

Navigator reads applicable project instructions, relevant source, configuration,
tests, documentation, history, and owner artifacts. When useful, it reads saved
workflow state and recovery context. It distinguishes current files from
intended behavior and recorded claims, including committed and dirty work. It
does not assume that a clean diff means there is nothing to explain.

Answers cite exact files and lines or artifact sections where applicable.
Navigator separates observations, intent, hypotheses, and unknowns.
Explanations, questions, hints, and summaries stay in the conversation. There is
no Navigator record, template, saved score, preferences file, or required fresh
chat.

## Modes

All three modes share the same evidence procedure and non-mutation rules.

| Mode          | Purpose and result                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `EXPLAIN`     | Understand existing work through explanations, examples, and useful visuals. The default.           |
| `INVESTIGATE` | Follow a question to a supported answer, or identify uncertainty and the smallest next observation. |
| `GRILL_ME`    | Check comprehension one question at a time, with specific feedback and adaptive follow-up.          |

Navigator infers topic and depth when clear, asking only when ambiguity matters.
You can redirect, skip a question, ask for a hint or answer, change depth or
mode, or stop. A bare continuation keeps the current conversational mode.

### Explain and investigate

Expect the essential answer first, expanded to the depth you request. Navigator
keeps necessary technical terms and explains them without overloaded jargon or
condescension. It may use a diagram for relationships, a timeline for sequences,
a table for comparisons, or an example for behavior. Simple answers need no
visual. Illustrative examples and predicted outputs are labeled, not presented
as executed results.

Investigation follows callers, transformations, state changes, outputs, and
failure paths as needed. A suspected defect includes evidence, its likely
consequence, and the owner who would address it. When evidence cannot settle a
question, Navigator identifies the smallest observation needed instead of
inventing a cause or historical design rationale.

### Grill me

Navigator inspects implementation before judging answers. It starts with the big
picture or your demonstrated level, asks one question, and waits. Feedback
identifies what is correct and what needs work. Hints support another attempt;
misunderstandings are revisited with a different example.

As understanding grows, questions can move through explanation, prediction,
debugging, and tradeoffs. These test comprehension of existing work; they do not
make new Scoper or Architect decisions. On completion or stopping, Navigator
summarizes demonstrated strengths, remaining gaps or untested areas, and useful
next reading. “Sufficient understanding” applies only to that topic and depth,
not complete mastery or workflow approval.

The adaptive-questioning idea is inspired by
[AI Hero's grill-me discussion](https://www.aihero.dev/skills-grill-me).
Navigator's procedure is authored for this framework; it neither installs nor
copies that skill or adopts its planning workflow.

## Invocation examples

Codex:

```text
$navigator Explain this project's purpose, entry points, and reading order.
$navigator INVESTIGATE: Why can this request return an empty result?
$navigator GRILL_ME on the retry flow, from overview to debugging.
```

Claude Code:

```text
/navigator Explain the behavior changed by these commits and my uncommitted edits.
/navigator INVESTIGATE: What does the current recovery frame mean?
/navigator GRILL_ME on how configuration reaches the worker.
```

Both clients require explicit invocation. Mode names describe local interaction,
not workflow states or cycle modes.

## Boundaries and stopping

Navigator never edits files, stages or commits, suggests commits, dispatches
roles, or persists quiz context. Even an explicit control-plane request during
navigation does not make Navigator initialize, promote, sign off, cancel, or
route recovery. It explains the action and its owner; performing it requires
leaving Navigator. Stopping a quiz does not cancel the workflow cycle.

Tests, builds, formatters, imports, and dry runs can write files or affect
external systems. Navigator inspects their execution paths first and uses only
diagnostics established to be non-mutating. If a needed check is not safe, it
uses existing evidence and identifies the remaining observation for work outside
Navigator. It does not run a mutating check and undo the effects.

Changed inputs cause Navigator to recheck evidence and correct earlier answers
or quiz feedback. Missing evidence stays an uncertainty. A quiz answer does not
verify an acceptance condition; an investigation does not issue a Reviewer
verdict or close another role's finding. There is no workflow completion gate or
state-changing handoff when navigation ends.

## Package and validation

The package contains shared instructions, three thin modes, a Codex adapter, and
authored scenarios in `skills/navigator/evals/evals.json`. Claude Code's
settings template registers explicit invocation. Scenarios are model evaluation
cases; JSON checks, Markdown lint, and documentation builds do not execute them
or establish behavioral passes. The installer remains unfinished.

See the canonical
[Navigator Boundary](../../reference/protocol/#navigator-boundary),
[ownership rules](../../concepts/ownership/), and
[runtime files](../../reference/runtime-files/).
