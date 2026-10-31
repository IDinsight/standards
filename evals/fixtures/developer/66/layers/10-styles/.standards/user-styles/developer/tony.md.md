# Tony's style for Node command-line tools

- Keep each function under about 25 lines; extract named helpers.
- Name helpers verb-first, such as `parseArgs` or `findDiscount`.
- CLI helpers return result objects; only the entry script touches `process`.
- Prefer `for...of` loops over `forEach`.
- Error messages start with the command name, as in `invoice: ...`.
