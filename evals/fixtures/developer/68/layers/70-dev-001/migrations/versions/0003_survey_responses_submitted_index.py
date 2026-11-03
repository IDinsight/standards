"""index survey responses by survey and submission time

Revision ID: 0003
Revises: 0002
Create Date: 2026-09-23 11:05:00
"""

from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_survey_responses_survey_id_submitted_at",
        "survey_responses",
        ["survey_id", "submitted_at"],
    )
    op.drop_index("ix_survey_responses_survey_id", table_name="survey_responses")


def downgrade() -> None:
    op.create_index("ix_survey_responses_survey_id", "survey_responses", ["survey_id"])
    op.drop_index("ix_survey_responses_survey_id_submitted_at", table_name="survey_responses")
