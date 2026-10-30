from dataclasses import dataclass, field

from bookmarks.tags import normalize_tag, parse_tags


@dataclass
class Bookmark:
    url: str
    title: str
    tags: list = field(default_factory=list)


class BookmarkStore:
    def __init__(self):
        self._items = {}

    def add(self, url, title, tags=""):
        bookmark = Bookmark(url, title.strip(), parse_tags(tags))
        self._items[url] = bookmark
        return bookmark

    def get(self, url):
        return self._items.get(url)

    def with_tag(self, tag):
        wanted = normalize_tag(tag)
        return [b for b in self._items.values() if wanted in b.tags]
