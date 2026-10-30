# Tony

Personal preferences for Python work.

- Type-annotate every function signature, private helpers included.
- Early returns instead of nested `if`/`else`.
- f-strings for all formatting; no `%` or `str.format()`.
- Single-quoted strings; double quotes only when the text contains a single quote.
- Numbers: plain `int` and `float`, rounded with the built-in `round()`. `Decimal` is noisy and I'd rather not see it in new code.
- Comprehensions over `for` loops that only append.
- If a block needs a comment to explain it, extract it into a named function.
