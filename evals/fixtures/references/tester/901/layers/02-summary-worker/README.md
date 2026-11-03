# helpdesk-worker

Background worker that writes a short summary of each support ticket so agents
can triage without reading the whole thread. It calls an OpenAI Chat
Completions-compatible API and keeps tickets, summaries, and queued jobs in one
SQLite file. It uses only the Python standard library.

## Setup

1. Copy `.env.example` to `.env` and set `LLM_API_KEY` to your own key.
   Environment variables override values in `.env`.
2. Queue a ticket and run the worker:

   ```sh
   python3 -m app.worker --enqueue 42
   python3 -m app.worker --once
   ```

   Without `--once` the worker keeps polling for due jobs.

## Tests

The tests need pytest:

```sh
python3 -m pytest
```
