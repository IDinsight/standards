"""index shipments.created_at

Revision ID: c7d05f3e1a84
Revises: 8b41e6d2a9c3
Create Date: 2026-04-16 14:02:19

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "c7d05f3e1a84"
down_revision = "8b41e6d2a9c3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index("ix_shipments_created_at", "shipments", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_shipments_created_at", table_name="shipments")
