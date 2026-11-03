# Tony's tester style

- Name tests after the behavior, not the function.
- Prefer table-driven cases with `for ... of` over copy-pasted tests.
- Assert the full output when it is short; use regex matches only for long text.
- Create fixtures in a temporary directory per test.
