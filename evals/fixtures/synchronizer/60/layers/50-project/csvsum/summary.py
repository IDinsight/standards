import csv


def _number(text):
    try:
        return float(text)
    except ValueError:
        return None


def summarize(handle, columns=None, delimiter=","):
    reader = csv.DictReader(handle, delimiter=delimiter)
    fields = reader.fieldnames or []
    wanted = columns or fields
    for name in wanted:
        if name not in fields:
            raise KeyError(name)
    values = {name: [] for name in wanted}
    for row in reader:
        for name in wanted:
            number = _number((row.get(name) or "").strip())
            if number is not None:
                values[name].append(number)
    results = {}
    for name in wanted:
        found = values[name]
        if not found:
            results[name] = {"count": 0}
        else:
            results[name] = {
                "count": len(found),
                "min": min(found),
                "max": max(found),
                "mean": sum(found) / len(found),
            }
    return results
