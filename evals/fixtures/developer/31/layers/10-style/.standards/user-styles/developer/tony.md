# Tony

My preferences for Developer work. They cover discretionary choices only.

- Prefer plain module-level functions over classes unless state is shared
  across calls.
- Use `pathlib.Path` rather than `os.path` for file handling.
- Give public functions a one-line docstring; skip docstrings on private
  helpers.
- Prefer an explicit `for` loop over a comprehension once the body needs more
  than one condition.
- Use a small named helper as a sort key instead of an inline `lambda`.
- Keep string formatting to f-strings.
