# worker

Builds reminder lines for enumerators with overdue survey assignments. Uses
`shared` from `packages/shared` through a uv path source.

From `apps/worker`:

    uv sync
    uv run pytest
    uv run ruff check .
