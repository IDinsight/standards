"""Run queued ticket summary jobs.

    python3 -m app.worker --enqueue 42   # queue a summary for ticket 42
    python3 -m app.worker --once         # run due jobs once and exit
    python3 -m app.worker                # keep polling
"""

import argparse
import logging
import time

import app.settings
from app.jobs.scheduler import JobScheduler
from app.llm.client import default_client
from app.llm.types import LLMError
from app.summaries.service import SummaryJob, run_summary_job
from app.summaries.store import SummaryStore
from app.tickets import TicketRepository

RETRY_DELAY_SECONDS = 300
POLL_INTERVAL_SECONDS = 5

log = logging.getLogger("helpdesk.worker")


def run_due_jobs(*, client, tickets, store, scheduler, now=None):
    ran = 0
    for job in scheduler.due(time.time() if now is None else now):
        try:
            run_summary_job(job, client=client, tickets=tickets, store=store)
        except LLMError as error:
            log.warning(
                "summary for ticket %s failed (%s); retrying in %ss",
                job.ticket_id,
                error,
                RETRY_DELAY_SECONDS,
            )
            scheduler.schedule(job, delay_seconds=RETRY_DELAY_SECONDS)
        ran += 1
    return ran


def main(argv=None):
    parser = argparse.ArgumentParser(prog="python3 -m app.worker", description="Run ticket summary jobs.")
    parser.add_argument("--enqueue", type=int, metavar="TICKET_ID", help="queue a summary job for a ticket and exit")
    parser.add_argument("--once", action="store_true", help="run due jobs once and exit")
    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

    config = app.settings.settings
    scheduler = JobScheduler(config.database_path)
    if args.enqueue is not None:
        scheduler.schedule(SummaryJob(args.enqueue, config.summary_max_tokens), delay_seconds=0)
        log.info("queued summary for ticket %s", args.enqueue)
        return 0

    tickets = TicketRepository(config.database_path)
    store = SummaryStore(config.database_path)
    client = default_client()
    while True:
        ran = run_due_jobs(client=client, tickets=tickets, store=store, scheduler=scheduler)
        log.info("ran %d summary job(s)", ran)
        if args.once:
            return 0
        time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    raise SystemExit(main())
