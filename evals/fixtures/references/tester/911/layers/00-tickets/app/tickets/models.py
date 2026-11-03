from dataclasses import dataclass
from datetime import datetime


@dataclass
class Ticket:
    id: int
    title: str
    status: str
    created_at: datetime
    description: str = ""
