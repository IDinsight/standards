# Python Development Style

Apply with `universal.md` for Python implementation.

- Follow the repository's supported Python version, formatter, linter, and type
  checker.
- Add type hints at public boundaries and where they materially improve
  correctness. Avoid ornamental annotations that obscure simple code.
- Prefer precise types over `Any`. Narrow unknown or heterogeneous values before
  using them.
- Avoid mutable default arguments. Use `None` or a factory as appropriate.
- Use context managers for files, locks, transactions, and other scoped
  resources.
- Catch exceptions only when the code can add context, recover, translate the
  boundary error, or perform required cleanup. Do not use broad silent catches.
- Prefer explicit data models or small value objects when data has invariants;
  do not create classes merely to group unrelated functions.
- Keep async code consistently async across the call path. Avoid blocking I/O in
  event-loop code unless the project already provides a safe adapter.
- Prefer `pathlib` when it fits established project conventions and improves
  path handling clarity.
- Keep comprehensions simple. Use ordinary loops when filtering, branching, or
  side effects make the expression difficult to read.
- Preserve import boundaries and avoid circular-import workarounds that hide a
  structural problem.
