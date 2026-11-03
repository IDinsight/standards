from datetime import date

from pydantic import BaseModel


class VisitRead(BaseModel):
    visit_id: str
    site_id: str
    visit_date: date
    visitor_count: int
