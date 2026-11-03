# helpdesk-api

Core pieces of the support desk service:

- `app/tickets/` — the ticket model.
- `app/summaries/` — one-sentence ticket summaries for the agent queue,
  produced by an LLM through `app/llm/client.py`.

Configure the LLM client with `HELPDESK_LLM_API_KEY`, and optionally
`HELPDESK_LLM_BASE_URL` and `HELPDESK_LLM_MODEL`.

Requires Python 3.11+, standard library only. Run the tests with
`python3 -m pytest`.
