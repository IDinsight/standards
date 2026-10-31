"""case summaries

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-10
"""

import sqlalchemy as sa
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "case_summaries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("case_id", sa.Integer(), sa.ForeignKey("cases.id"), nullable=False),
        sa.Column("text", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_case_summaries_case_id", "case_summaries", ["case_id"])


def downgrade() -> None:
    op.drop_index("ix_case_summaries_case_id", table_name="case_summaries")
    op.drop_table("case_summaries")
