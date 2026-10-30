from bookmarks.store import BookmarkStore


def test_add_and_get():
    store = BookmarkStore()
    store.add("https://example.org", " Example ", "news,tech")
    bookmark = store.get("https://example.org")
    assert bookmark.title == "Example"
    assert bookmark.tags == ["news", "tech"]


def test_with_tag():
    store = BookmarkStore()
    store.add("https://a.example", "A", "python")
    store.add("https://b.example", "B", "rust")
    assert [b.url for b in store.with_tag("python")] == ["https://a.example"]
