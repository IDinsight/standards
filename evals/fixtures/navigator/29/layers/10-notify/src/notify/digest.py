from collections import defaultdict


def group_by_owner(rows):
    grouped = defaultdict(list)
    for row in rows:
        grouped[row["owner"]].append(row)
    return dict(grouped)


def render_digest(owner, rows):
    lines = [f"Open records for {owner}: {len(rows)}"]
    for row in sorted(rows, key=lambda r: r["id"]):
        lines.append(f"- #{row['id']} ({row['region']})")
    return "\n".join(lines)
