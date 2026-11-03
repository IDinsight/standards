# Project Context

## Project Baseline

- helpdesk-worker is a background worker that writes short summaries of
  support tickets with an OpenAI Chat Completions-compatible API. Python
  standard library only; no web framework. Tickets, summaries, and queued jobs
  live in one SQLite file.

## Stack and Tooling

- Python 3 (CI uses 3.12); `sqlite3`, `urllib`, `json`, `dataclasses`.
- pytest is the only development dependency; there is no requirements file or
  lockfile. `pyproject.toml` sets pytest `pythonpath` and `testpaths`.

## Structure and Boundaries

- `app/settings.py` — `Settings` dataclass and module-level
  `settings = load_settings()`. Reads `KEY=VALUE` lines from `.env` at the
  project root (located from the module path, not the working directory), then
  overlays `os.environ`; the environment wins. Loaded once, on first import.
  `LLM_API_KEY` defaults to an empty string.
- `app/llm/types.py` — `Completion(text, finish_reason, refusal)`, `LLMError`,
  and `RateLimitError(retry_after)`, a subclass of `LLMError`.
- `app/llm/client.py` — `LLMClient.complete(messages, *, max_tokens)` POSTs to
  `{base_url}/chat/completions` with `Authorization: Bearer <LLM_API_KEY>`.
  HTTP 429 raises `RateLimitError` with `Retry-After` in seconds (60 when the
  header is missing or invalid); other failures raise `LLMError`.
  `default_client()` builds a client from `app.settings.settings`; the module
  imports `app.settings` at import time.
- `app/summaries/service.py` — `SummaryJob(ticket_id, max_tokens)` and
  `run_summary_job(job, *, client, tickets, store)`; the caller passes every
  collaborator.
- `app/summaries/store.py`, `app/jobs/scheduler.py`, `app/tickets.py` —
  SQLite-backed summary store, job scheduler (`schedule(job, *, delay_seconds)`,
  `due(now)`), and ticket repository (`get_text(ticket_id)`).
- `app/worker.py` — `run_due_jobs` and the CLI (`--enqueue TICKET_ID`,
  `--once`).

## Commands

- `python3 -m pytest` — runs `tests/`.
- `python3 -m app.worker --enqueue <ticket id>` and
  `python3 -m app.worker --once` — queue and run summary jobs; they need a
  provider key in `.env` or the environment and network access to the
  provider.

## Conventions and Constraints

- Standard library only in `app/`.
- Secrets come from the environment or an untracked `.env`; `.env` is
  gitignored, and `.env.example` lists the settings with an empty
  `LLM_API_KEY`.
- CI (`.github/workflows/ci.yml`) runs `python3 -m pytest` on Python 3.12 with
  no secrets configured.

## External Systems and Data

- Provider: Chat Completions-compatible endpoint at `LLM_BASE_URL` (default
  `https://api.openai.com/v1`). Fields read: `choices[0].message.content`,
  `choices[0].message.refusal`, and `choices[0].finish_reason`.
- SQLite file at `DATABASE_PATH`.

## Testing and Verification Baseline

- `tests/test_store.py` and `tests/test_scheduler.py` (5 tests) cover the
  summary store and the scheduler with the `tmp_db` fixture from
  `tests/conftest.py`, and pass. No tests cover `app/summaries/service.py`,
  `app/llm/`, `app/settings.py`, or `app/worker.py`.

## Relevant Existing Behavior

- `run_summary_job` saves the completion text whenever it is non-empty,
  whatever the finish reason, and raises `LLMError` when there is no text. It
  ignores `refusal`.
- `run_due_jobs` catches `LLMError` (including `RateLimitError`) and schedules
  the same job again after `RETRY_DELAY_SECONDS` (300).

## Evidence

- `python3 -m pytest -q` at the project root — 5 passed.
- The source files listed under Structure and Boundaries.
