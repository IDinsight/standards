def clamp_page(offset: int, limit: int, max_limit: int) -> tuple[int, int]:
    """Return a non-negative offset and a limit between 1 and max_limit."""
    return max(offset, 0), max(1, min(limit, max_limit))
