def normalize_tag(tag):
    """Trim, collapse inner whitespace, and lowercase a tag name."""
    return " ".join(tag.split()).lower()


def parse_tags(raw):
    """Split a comma-separated tag string into a list of normalized tags."""
    if not raw:
        return []
    tags = []
    for part in raw.split(","):
        tag = normalize_tag(part)
        if tag and tag not in tags:
            tags.append(tag)
    return tags
