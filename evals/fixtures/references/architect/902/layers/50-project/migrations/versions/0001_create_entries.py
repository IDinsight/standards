"""create entries

Revision ID: 0001
Revises:
Create Date: 2024-03-11
"""
import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "entries",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("account", sa.String(64), nullable=False),
        sa.Column("amount_cents", sa.BigInteger, nullable=False),
        sa.Column("memo", sa.String(255)),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_entries_account", "entries", ["account"])


def downgrade():
    op.drop_index("ix_entries_account", table_name="entries")
    op.drop_table("entries")
