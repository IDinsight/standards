from types import SimpleNamespace

from app.jobs.scheduler import JobScheduler


def job(ticket_id, max_tokens=400):
    return SimpleNamespace(ticket_id=ticket_id, max_tokens=max_tokens)


def pending(jobs):
    return [(j.ticket_id, j.max_tokens) for j in jobs]


def test_job_is_due_after_its_delay(tmp_db):
    scheduler = JobScheduler(tmp_db)
    scheduler.schedule(job(1), delay_seconds=30, now=1000.0)
    assert pending(scheduler.due(1029.0)) == []
    assert pending(scheduler.due(1030.0)) == [(1, 400)]


def test_due_jobs_are_returned_once(tmp_db):
    scheduler = JobScheduler(tmp_db)
    scheduler.schedule(job(1), delay_seconds=0, now=1000.0)
    assert pending(scheduler.due(1000.0)) == [(1, 400)]
    assert pending(scheduler.due(1000.0)) == []


def test_due_jobs_come_in_run_order(tmp_db):
    scheduler = JobScheduler(tmp_db)
    scheduler.schedule(job(1), delay_seconds=60, now=1000.0)
    scheduler.schedule(job(2, 800), delay_seconds=0, now=1000.0)
    assert pending(scheduler.due(2000.0)) == [(2, 800), (1, 400)]
