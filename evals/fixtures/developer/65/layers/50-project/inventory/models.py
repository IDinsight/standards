from dataclasses import dataclass


@dataclass(frozen=True)
class Item:
    sku: str
    name: str
    quantity: int
    reorder_level: int

    @property
    def is_low(self) -> bool:
        return self.quantity <= self.reorder_level
