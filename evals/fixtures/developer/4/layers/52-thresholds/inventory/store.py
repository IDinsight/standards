from inventory.models import Item


class InventoryStore:
    def __init__(self):
        self._items = {}

    def add(self, sku, name, quantity=0, reorder_threshold=None):
        if quantity < 0:
            raise ValueError("quantity must be non-negative")
        _check_threshold(reorder_threshold)
        item = Item(sku, name, quantity, reorder_threshold)
        self._items[sku] = item
        return item

    def get(self, sku):
        return self._items.get(sku)

    def adjust(self, sku, delta):
        item = self._items[sku]
        if item.quantity + delta < 0:
            raise ValueError("insufficient stock")
        item.quantity += delta
        return item

    def set_threshold(self, sku, threshold):
        _check_threshold(threshold)
        item = self._items[sku]
        item.reorder_threshold = threshold
        return item

    def items(self):
        return sorted(self._items.values(), key=lambda item: item.sku)


def _check_threshold(threshold):
    if threshold is not None and threshold < 0:
        raise ValueError("reorder threshold must be non-negative")
