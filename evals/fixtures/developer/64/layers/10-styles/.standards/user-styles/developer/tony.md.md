# Tony, compact

- Keep functions under about 20 lines; extract a named helper instead of nesting.
- Comment only non-obvious decisions; skip JSDoc on self-explanatory functions.
- Prefer `for...of` loops over `reduce` when the body has more than one statement.
- Use descriptive names, including in arrow callbacks.
- Export each function where it is declared.
