from collections import defaultdict
from datetime import timedelta


def week_start(day):
    return day - timedelta(days=day.weekday())


def weekly_summary(entries, week_of):
    start = week_start(week_of)
    end = start + timedelta(days=7)
    totals = defaultdict(int)
    for entry in entries:
        if start <= entry.day < end:
            totals[entry.project] += entry.minutes
    return {
        "week": start.isoformat(),
        "projects": [
            {"project": name, "minutes": totals[name]}
            for name in sorted(totals)
        ],
    }
