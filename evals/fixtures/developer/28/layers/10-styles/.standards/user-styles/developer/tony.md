# Tony's development style

Personal preferences for Developer work. They apply only where the project
and the design leave the choice open.

- Use guard clauses and early returns instead of nested `if`/`else` blocks.
- Keep functions short; split anything that grows past about 25 lines.
- Add type hints to every new or changed public function signature.
- Write one-line docstrings on public functions, in the imperative
  ("Return ...", "Raise ...").
- Prefer small pure functions for filtering and formatting; keep file and
  console I/O at the edges.
- Raise specific exceptions with a message that names the offending value.
