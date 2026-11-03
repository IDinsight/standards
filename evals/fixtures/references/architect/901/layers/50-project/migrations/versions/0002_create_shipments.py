"""create shipments

Revision ID: 8b41e6d2a9c3
Revises: 3f2a9c1d7b10
Create Date: 2026-03-04 10:31:05

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "8b41e6d2a9c3"
down_revision = "3f2a9c1d7b10"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "shipments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("reference", sa.String(64), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("reference", name="uq_shipments_reference"),
    )


def downgrade() -> None:
    op.drop_table("shipments")
