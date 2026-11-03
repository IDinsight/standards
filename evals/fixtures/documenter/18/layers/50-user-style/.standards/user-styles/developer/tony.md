# Tony's developer style

- Keep functions under 30 lines where practical; split by responsibility, not by line count alone.
- Use guard clauses for early exits instead of nested conditionals.
- Group imports: Node built-ins, workspace packages, then relative paths, with a blank line between groups.
- Name test cases as plain sentences describing the behavior they check.
- Prefer returning new objects over mutating arguments.
- In suggested commit messages, name the affected module in the scope, for example `feat(export): ...`.
