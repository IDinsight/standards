"""create customers

Revision ID: 3f2a9c1d7b10
Revises:
Create Date: 2026-03-04 10:12:41

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "3f2a9c1d7b10"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "customers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("fax", sa.String(32), nullable=True),
        sa.UniqueConstraint("email", name="uq_customers_email"),
    )


def downgrade() -> None:
    op.drop_table("customers")
