"""Build and save the summary of a support ticket."""

from dataclasses import dataclass

from app.llm.types import LLMError

SYSTEM_PROMPT = (
    "You summarize customer support tickets for the agent who picks them up. "
    "Write two or three plain sentences: the problem, what the customer has tried, "
    "and what they are asking for."
)


@dataclass(frozen=True)
class SummaryJob:
    ticket_id: int
    max_tokens: int


def build_messages(ticket_text):
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": ticket_text},
    ]


def run_summary_job(job, *, client, tickets, store) -> None:
    ticket_text = tickets.get_text(job.ticket_id)
    completion = client.complete(build_messages(ticket_text), max_tokens=job.max_tokens)
    if not completion.text:
        raise LLMError(f"empty completion for ticket {job.ticket_id}")
    store.save_summary(job.ticket_id, completion.text)
