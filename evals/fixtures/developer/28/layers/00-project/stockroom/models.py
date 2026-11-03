from dataclasses import dataclass


@dataclass
class Item:
    sku: str
    name: str
    on_hand: int
