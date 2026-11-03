"""add shipments.notes

Revision ID: 9a6e2b4f1c08
Revises: 5d3c8f0a2e67
Create Date: 2026-08-11 16:05:12

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "9a6e2b4f1c08"
down_revision = "5d3c8f0a2e67"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("shipments", sa.Column("notes", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("shipments", "notes")
