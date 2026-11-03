"""drop customers.fax

Revision ID: 5d3c8f0a2e67
Revises: 1e9a7b6c4d52
Create Date: 2026-06-02 11:20:57

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "5d3c8f0a2e67"
down_revision = "1e9a7b6c4d52"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column("customers", "fax")


def downgrade() -> None:
    op.add_column("customers", sa.Column("fax", sa.String(32), nullable=True))
