def parse_tags(raw):
    """Split a comma-separated tag string into a list of tags."""
    if not raw:
        return []
    return [part for part in raw.split(",") if part]
