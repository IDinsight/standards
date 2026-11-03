"""users and cases

Revision ID: 0001
Revises:
Create Date: 2026-08-03
"""

import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table(
        "cases",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("notes", sa.String(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_cases_owner_id", "cases", ["owner_id"])


def downgrade() -> None:
    op.drop_index("ix_cases_owner_id", table_name="cases")
    op.drop_table("cases")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
