import os

from reportkit.prune import cutoff_for, prune


def test_cutoff():
    assert cutoff_for(1_000_000, 1) == 913_600


def test_prune_removes_only_old_files(tmp_path):
    old = tmp_path / "old.csv"
    new = tmp_path / "new.csv"
    old.write_text("x")
    new.write_text("y")
    (tmp_path / "keep").mkdir()
    now = 10 * 86400
    os.utime(old, (0, 0))
    os.utime(new, (now, now))
    assert prune(tmp_path, 1, now=now) == ["old.csv"]
    assert new.exists()
    assert (tmp_path / "keep").exists()
