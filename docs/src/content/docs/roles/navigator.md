---
title: Navigator
description:
  Understand the project, investigate a question, or test your understanding.
---

Navigator helps you understand existing work without changing it. Ask for a
project introduction, an explanation of a function, help tracing a problem, or a
quiz on something you want to learn.

## When to use Navigator

You can use Navigator at any time, including during expedited work or after a
cycle ends. It does not require an active cycle or a complete installed runtime
to explain available project files.

## Modes

Navigator uses one of three separate modes at a time. You can select a mode
explicitly or let Navigator choose from your request. Use `$navigator` in Codex
or `/navigator` in Claude Code. You can change the topic, depth, or mode at any
time.

### EXPLAIN

The default for explanations and project introductions. Use it to understand
what existing work does and how it fits together, with examples or diagrams when
useful.

```text
$navigator EXPLAIN: What is this project's purpose, and where should I start reading?
```

### INVESTIGATE

Use this mode for a concrete question or unexplained behavior. Navigator follows
the evidence and checks possible explanations. It gives a supported answer or
identifies what remains unknown and what would help resolve it.

```text
$navigator INVESTIGATE: Why can this request return an empty result?
```

### GRILL_ME

Test your understanding with one question at a time. Navigator waits for your
answer and gives feedback before continuing. You can ask for a hint or answer,
skip a question, or stop.

```text
$navigator GRILL_ME on the retry flow.
```

Navigator adapts to what you have demonstrated. It ends with a brief account of
what you understand and what remains untested. That feedback concerns the chosen
topic; it does not approve project work.

## What to expect

Navigator reads relevant code, documentation, configuration, history, and saved
workflow records. It cites files and explains the difference between intended
behavior, what the evidence supports, and what is still uncertain. If files
change, it rechecks affected explanations.

Answers, questions, and quiz progress stay in the conversation. Navigator
creates no saved report or score and needs no fresh assessment session.

## What stays unchanged

Navigator never edits files, stages or commits changes, suggests a commit, runs
another role, or changes workflow state. Even if you ask, signing off,
cancelling, or changing a cycle requires leaving Navigator. Stopping a quiz only
stops the quiz.

It runs a diagnostic only after establishing that it will not change files or
external systems. A test or a command called “dry run” is not automatically
safe. Where that cannot be established, Navigator uses existing evidence and
explains what still needs checking.

Navigator can explain a suspected defect and its likely owner. It does not make
repairs, provide Tester's verification, or issue Reviewer's verdict. See the
[full boundary](../../reference/protocol/#navigator-boundary).

The quiz format is inspired by
[AI Hero's grill-me discussion](https://www.aihero.dev/skills-grill-me);
Navigator has its own procedure for understanding existing work.
