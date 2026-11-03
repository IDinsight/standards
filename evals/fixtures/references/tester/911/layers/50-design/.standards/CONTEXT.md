# Project Context

## Project Baseline

- helpdesk-api is a small Python package for a support desk. Tickets are plain
  dataclasses; `app/summaries/` produces one-sentence ticket summaries through
  an LLM client. No export capability exists yet.

## Stack and Tooling

- Python 3.11+, standard library only; `pyproject.toml` declares no
  dependencies. Tests use pytest.

## Structure and Boundaries

- `app/tickets/models.py` — `Ticket` dataclass with `id`, `title`, `status`,
  `created_at` (a `datetime`), and `description`.
- `app/llm/client.py` — `LLMClient`, a urllib client for an OpenAI-compatible
  chat completions API; reads `HELPDESK_LLM_API_KEY`, `HELPDESK_LLM_BASE_URL`,
  and `HELPDESK_LLM_MODEL`.
- `app/summaries/service.py` — `SummaryService`, the only caller of the LLM
  client; caches one summary per ticket id.

## Commands

- `python3 -m pytest -q` — run the test suite from the project root.

## Conventions and Constraints

- No third-party packages. Modules receive collaborators as arguments (the
  summary service takes a client) rather than constructing them.

## External Systems and Data

- LLM provider over HTTPS through `LLMClient`; tests replace it with a fake and
  never call the provider.

## Testing and Verification Baseline

- `tests/test_summaries.py` — three tests of `SummaryService` with an in-file
  fake client. There are no other tests.

## Evidence

- `pyproject.toml`, `app/`, `tests/test_summaries.py`.
- `python3 -m pytest -q` — 3 passed.
