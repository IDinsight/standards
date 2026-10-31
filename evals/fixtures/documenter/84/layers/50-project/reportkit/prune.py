import os
import time

SECONDS_PER_DAY = 86400


def cutoff_for(now, retention_days):
    """Return the modification time before which files are removed."""
    return now - retention_days * SECONDS_PER_DAY


def prune(directory, retention_days, now=None):
    """Delete regular files in directory last modified before the cutoff.

    Returns the names of the removed files, sorted. Subdirectories are left alone.
    """
    cutoff = cutoff_for(time.time() if now is None else now, retention_days)
    removed = []
    for name in sorted(os.listdir(directory)):
        path = os.path.join(directory, name)
        if os.path.isfile(path) and os.path.getmtime(path) < cutoff:
            os.remove(path)
            removed.append(name)
    return removed
