from dataclasses import dataclass
from typing import Optional

STATUSES = ("active", "suspended", "closed")


@dataclass
class Account:
    id: int
    name: str
    email: str
    status: str = "active"
    phone: Optional[str] = None
    mailing_address: Optional[str] = None
