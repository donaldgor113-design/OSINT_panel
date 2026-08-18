"""registries and queries tables

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-19

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "registries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("auth_type", sa.String(50)),
        sa.Column("auth_data_encrypted", sa.LargeBinary()),
        sa.Column("base_url", sa.String(500)),
        sa.Column("api_endpoint", sa.String(500)),
        sa.Column("requires_vpn", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("requires_almaz", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("almaz_key_id", sa.String(255)),
        sa.Column("rate_limit_requests", sa.Integer()),
        sa.Column("rate_limit_period_seconds", sa.Integer()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("last_tested_at", sa.DateTime(timezone=True)),
        sa.Column("is_healthy", sa.Boolean()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_registries_is_active", "registries", ["is_active"])
    op.create_index("idx_registries_auth_type", "registries", ["auth_type"])

    op.create_table(
        "queries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("query_text", sa.Text(), nullable=False),
        sa.Column("query_type", sa.String(50)),
        sa.Column("registry_id", postgresql.UUID(as_uuid=True)),
        sa.Column("source_system", sa.String(100)),
        sa.Column("executed_at", sa.DateTime(timezone=True)),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("execution_duration_ms", sa.Integer()),
        sa.Column("result_count", sa.Integer()),
        sa.Column("result_data_encrypted", sa.LargeBinary()),
        sa.Column("tags", postgresql.JSONB()),
        sa.Column("confidence_level", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["registry_id"], ["registries.id"]),
    )
    op.create_index("idx_queries_user_id", "queries", ["user_id"])
    op.create_index("idx_queries_source_system", "queries", ["source_system"])
    op.create_index("idx_queries_created_at", "queries", ["created_at"])


def downgrade() -> None:
    op.drop_table("queries")
    op.drop_table("registries")
