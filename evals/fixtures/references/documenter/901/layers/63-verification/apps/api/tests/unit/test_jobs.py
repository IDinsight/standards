import pytest

from app.config import Settings, SettingsError, load_settings
from app.jobs import IdempotencyConflict, ImportJobs, UploadTooLarge, connect


@pytest.fixture
def jobs(tmp_path):
    return ImportJobs(connect("sqlite:///:memory:"), Settings("sqlite:///:memory:", str(tmp_path), 1024))


def test_import_max_bytes_is_required():
    with pytest.raises(SettingsError):
        load_settings({})
    assert load_settings({"IMPORT_MAX_BYTES": "2048"}).import_max_bytes == 2048


def test_new_job_is_pending_then_done(jobs):
    job, created = jobs.create("a.csv", b"id\n1\n")
    assert created and job.status == "pending"
    jobs.process(job.id)
    assert jobs.get(job.id).status == "done"


def test_unreadable_file_fails_with_error(jobs):
    job, _ = jobs.create("bad.csv", b"\xff\xfe\x00")
    jobs.process(job.id)
    stored = jobs.get(job.id)
    assert stored.status == "failed" and stored.error


def test_same_key_same_file_returns_existing_job(jobs):
    first, _ = jobs.create("a.csv", b"id\n1\n", key="k1")
    again, created = jobs.create("a.csv", b"id\n1\n", key="k1")
    assert again.id == first.id and not created


def test_same_key_different_file_conflicts(jobs):
    jobs.create("a.csv", b"id\n1\n", key="k1")
    with pytest.raises(IdempotencyConflict):
        jobs.create("b.csv", b"id\n2\n", key="k1")


def test_rejects_file_over_limit(jobs):
    with pytest.raises(UploadTooLarge):
        jobs.create("big.csv", b"x" * 1025)
