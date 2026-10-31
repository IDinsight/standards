# Imports every table model so Alembic autogenerate sees the full metadata.
from app.surveys.model import Survey  # noqa: F401
from app.users.model import User  # noqa: F401
