---
title: Writing User Styles
description: Write your own preferences for a role, starting from an example.
---

A [user style](../../reference/runtime-files/#user-styles) is a Markdown file
with your preferences for one role, such as how you like code ordered or
explanations written. STANDARDS doesn't install any. This page shows how to add
one and gives an example for each role that you can copy and change.

## Add a style

1. Create the file at `.standards/user-styles/<role>/<name>.md`, where `<role>`
   is the role's skill name, such as `developer`. The examples below use the
   name `tony`.
2. Write your preferences in plain Markdown. No format is required; a heading
   and a short numbered list work well.
3. Name the style when you invoke the role:

   ```text
   Codex:       $developer Use user style tony.
   Claude Code: /developer Use user style tony.
   ```

A role never picks a style on its own. To see the styles a role can find,
[ask it for help](../../roles/overview/#ask-a-role-for-help), for example with
`/developer help`.

## What to put in a style

A style covers choices the role would otherwise make itself, such as how code is
ordered and named, how tests are organized, or how findings and explanations are
worded. Write each preference as a direct instruction, and say when an exception
is fine.

A style can't change what the work has to achieve. The role still follows the
protocol, the agreed requirements and design, the required shape of a record,
your project's instructions and tooling, and correctness. The
[user style rules](../../reference/runtime-files/#user-styles) explain which
roles save your choice and when Developer locks it.

## Examples

Each example is a complete file. Copy one into `.standards/user-styles/<role>/`,
rename it if you like, and edit it to match how you work.

### Scoper

Save as `.standards/user-styles/scoper/tony.md`:

```markdown
## Preserve the baseline

When scoping changes to an existing system, use its established behavior and
limitations as the baseline. Require the proposed change to achieve its intended
outcomes without introducing defects or worsening existing limitations.

Existing defects, omissions, and technical debt do not automatically become
requirements for this work. Include remediation only when it is explicitly
requested, necessary to achieve the agreed outcomes, or necessary to prevent the
change from introducing or worsening a problem.

Record relevant inherited limitations as context and, where useful, explicit
exclusions. Do not turn them into acceptance conditions merely because they were
discovered. If an existing limitation makes the requested outcome infeasible,
explain the dependency and resolve the scope rather than silently expanding it.

For example, an existing limitation in OpenTelemetry metrics tracking does not
by itself require remediation. It becomes relevant to this scope if the proposed
change worsens it or requires capabilities that the limitation prevents.
```

### Tester

Save as `.standards/user-styles/tester/tony.md`:

```markdown
## Python

1. Functions, classes, methods, global variables, etc. should be placed
   alphabetically within logical groups in each module. Exceptions are allowed
   when ordering would break execution or make the code difficult to understand,
   including dependencies, Pydantic validators, and type definitions.
2. When calling functions or methods with multiple arguments, use keyword
   arguments in alphabetical order, except where the API requires positional
   arguments. Single-argument calls may use positional arguments.
3. Docstrings are always in NumPy format.
4. Use blank lines to separate logical sections within function and
   control-block bodies where they improve readability.
5. Always use type hints in function and method signatures. Elsewhere, use them
   when helpful. The repo's `mypy` tool checks type hints.
6. Do not call external APIs or paid services in tests. Mock or stub those
   boundaries. Local MCP client/server integration checks are allowed. If
   external mocking would leave important behavior unverified, explain the gap
   and await my decision.
7. Always reuse existing pytest fixtures when possible. If a new fixture is
   needed, it should be added to the `conftest.py` file in the appropriate
   directory.
8. Private function/method/class/variable names should begin with an underscore
   to distinguish against their public counterparts. Preserve framework-required
   names and established public interfaces.
```

### Architect

Save as `.standards/user-styles/architect/tony.md`:

```markdown
## Design writing

1. Explain each decision in plain language before naming the tools or patterns
   behind it.
2. Give each rejected alternative one sentence on why it was not chosen.
3. Describe data and control flow as numbered steps.
4. Spell out acronyms on first use.
```

### Navigator

Save as `.standards/user-styles/navigator/tony.md`:

```markdown
## Explanation style

1. Use clear technical English inspired by ASD-STE100.
2. Use short sentences, active voice, and one main idea per sentence.
3. Use consistent terms. Explain necessary technical terms and acronyms.
4. Preserve exact code names and technical meaning.
5. Apply STE principles flexibly to keep explanations natural and accurate.
```

### Developer

Save as `.standards/user-styles/developer/tony.md`:

```markdown
## Python

1. Functions, classes, methods, global variables, etc. should be placed
   alphabetically within logical groups in each module. Exceptions are allowed
   when ordering would break execution or make the code difficult to understand,
   including dependencies, Pydantic validators, and type definitions.
2. When calling functions or methods with multiple arguments, use keyword
   arguments in alphabetical order, except where the API requires positional
   arguments. Single-argument calls may use positional arguments.
3. Docstrings are always in NumPy format. When helpful for understanding,
   include a short but meaningful `Examples` section showing how the function or
   method is typically invoked **and** what output it produces. Do not include
   trivial or filler examples just for the sake of it. It's ok not to include
   examples if they serve no concrete purpose.
4. Use blank lines to separate logical sections within function and
   control-block bodies where they improve readability.
5. Keep McCabe complexity <= 10. This is checked by the repo's `pylint` tool.
6. Always use type hints in function and method signatures. Elsewhere, use them
   when helpful. The repo's `mypy` tool checks type hints.
7. Use inline comments where helpful to explain complex or tricky code.
8. Private function/method/class/variable names should begin with an underscore
   to distinguish against their public counterparts. Preserve framework-required
   names and established public interfaces.
```

### Auditor

Save as `.standards/user-styles/auditor/tony.md`:

```markdown
## Context writing

1. Keep each entry to one or two sentences.
2. Write commands exactly as the project runs them, such as `uv run pytest`.
3. When a tool enforces a convention, name the tool and its config file, such as
   Ruff in `pyproject.toml`.
4. Use the project's own names for modules and features.
```

### Reviewer

Save as `.standards/user-styles/reviewer/tony.md`:

```markdown
## Finding style

1. Start each failure case with the input or action that triggers it.
2. Describe impact in terms of what a user or operator would notice.
3. Keep the smallest correction to one or two sentences. Do not include a full
   code rewrite.
4. Avoid hedging words such as "might" and "possibly" unless the evidence is
   uncertain. When it is, say what is uncertain.
```

### Documenter

Save as `.standards/user-styles/documenter/tony.md`:

```markdown
## Documentation style

1. Avoid overloaded jargon, promotional language, filler, and stock AI phrases.
2. Use technical language only when necessary or required.
3. Use plain language and simple explanations.
```

### Synchronizer

Save as `.standards/user-styles/synchronizer/tony.md`:

```markdown
## Record style

1. Describe each discrepancy in plain words that name both sides, for example
   "the design says the export is admin-only, but the route allows any user".
2. Explain why it matters in one more sentence.
3. Use the same terms as the scope and design.
4. In the summary, list open discrepancies as bullets when there are more than
   two.
```
