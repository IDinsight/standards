"""add shipments.status

Revision ID: 1e9a7b6c4d52
Revises: c7d05f3e1a84
Create Date: 2026-04-21 09:47:33

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "1e9a7b6c4d52"
down_revision = "c7d05f3e1a84"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "shipments",
        sa.Column("status", sa.String(32), nullable=False, server_default="pending"),
    )


def downgrade() -> None:
    op.drop_column("shipments", "status")
