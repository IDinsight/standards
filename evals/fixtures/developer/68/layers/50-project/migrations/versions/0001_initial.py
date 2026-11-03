"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-11 10:12:00
"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sqlmodel.sql.sqltypes.AutoString(length=320), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table(
        "surveys",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("title", sqlmodel.sql.sqltypes.AutoString(length=200), nullable=False),
        sa.Column("is_open", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_surveys_owner_id", "surveys", ["owner_id"])


def downgrade() -> None:
    op.drop_index("ix_surveys_owner_id", table_name="surveys")
    op.drop_table("surveys")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
