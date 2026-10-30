# bookmarks

In-memory bookmark store with comma-separated tags.

```python
from bookmarks.store import BookmarkStore

store = BookmarkStore()
store.add("https://example.org", "Example", "news,tech")
store.with_tag("news")
```

Run the tests with `python3 -m pytest -q` from the repository root.
