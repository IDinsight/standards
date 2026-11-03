"""Build and save the summary of a support ticket."""

from dataclasses import dataclass

from app.llm.types import LLMError, RateLimitError

UNAVAILABLE = "unavailable"

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


def run_summary_job(job, *, client, tickets, store, scheduler) -> None:
    ticket_text = tickets.get_text(job.ticket_id)
    try:
        completion = client.complete(build_messages(ticket_text), max_tokens=job.max_tokens)
    except RateLimitError as error:
        scheduler.schedule(job, delay_seconds=error.retry_after)
        return

    if completion.refusal:
        store.save_summary(job.ticket_id, UNAVAILABLE)
        return

    if completion.finish_reason == "length":
        scheduler.schedule(SummaryJob(job.ticket_id, job.max_tokens * 2), delay_seconds=0)
        return

    if completion.finish_reason == "stop" and completion.text:
        store.save_summary(job.ticket_id, completion.text)
        return

    raise LLMError(
        f"unusable completion for ticket {job.ticket_id}: "
        f"finish_reason={completion.finish_reason!r}"
    )
