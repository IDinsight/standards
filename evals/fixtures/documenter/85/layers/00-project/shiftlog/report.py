import math

QUARTER = 15


def billable_minutes(minutes):
    return math.ceil(minutes / QUARTER) * QUARTER


def daily_hours(shifts):
    totals = {}
    for shift in sorted(shifts, key=lambda s: (s.day, s.start)):
        totals[shift.day] = totals.get(shift.day, 0) + billable_minutes(shift.minutes)
    return {day: minutes / 60 for day, minutes in totals.items()}


def format_week(shifts):
    hours = daily_hours(shifts)
    lines = [f"{day.isoformat()}  {value:.2f}" for day, value in hours.items()]
    lines.append(f"{'Total':<10}  {sum(hours.values()):.2f}")
    return "\n".join(lines)
