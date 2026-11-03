"""survey responses

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-02 15:40:00
"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "survey_responses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("survey_id", sa.Integer(), nullable=False),
        sa.Column(
            "respondent_ref", sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False
        ),
        sa.Column("answers", sa.JSON(), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["survey_id"], ["surveys.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_survey_responses_survey_id", "survey_responses", ["survey_id"])


def downgrade() -> None:
    op.drop_index("ix_survey_responses_survey_id", table_name="survey_responses")
    op.drop_table("survey_responses")
