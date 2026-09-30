"""Initial multi-user schema with OAuth users.

Revision ID: 0001_users
Revises:
Create Date: 2026-09-30
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001_users"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("display_name", sa.String(length=160), nullable=True),
        sa.Column("avatar_url", sa.String(length=512), nullable=True),
        sa.Column("provider", sa.String(length=16), nullable=False),
        sa.Column("provider_sub", sa.String(length=255), nullable=False),
        sa.Column("token_version", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.CheckConstraint("provider IN ('google', 'apple')", name="ck_users_provider"),
        sa.UniqueConstraint("provider", "provider_sub", name="uq_users_provider_sub"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "brands",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("normalized_name", sa.String(length=80), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.UniqueConstraint("user_id", "normalized_name", name="uq_brands_user_normalized_name"),
    )
    op.create_index(
        "ix_brands_user_normalized_name", "brands", ["user_id", "normalized_name"]
    )

    op.create_table(
        "storages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("normalized_name", sa.String(length=80), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "user_id", "normalized_name", name="uq_storages_user_normalized_name"
        ),
    )
    op.create_index(
        "ix_storages_user_normalized_name", "storages", ["user_id", "normalized_name"]
    )

    op.create_table(
        "items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column(
            "brand_id",
            sa.Integer(),
            sa.ForeignKey("brands.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "storage_id",
            sa.Integer(),
            sa.ForeignKey("storages.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("category_id", sa.String(length=160), nullable=True),
        sa.Column("gender", sa.String(length=16), nullable=True),
        sa.Column("price_amount", sa.Numeric(12, 2), nullable=True),
        sa.Column("price_currency", sa.String(length=3), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("last_used_date", sa.Date(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "gender IS NULL OR gender IN ('male', 'female', 'unisex')",
            name="ck_items_gender",
        ),
        sa.CheckConstraint(
            "price_amount IS NULL OR price_amount >= 0",
            name="ck_items_price_non_negative",
        ),
    )
    op.create_index("ix_items_user_id", "items", ["user_id"])
    op.create_index("ix_items_category_id", "items", ["category_id"])
    op.create_index("ix_items_brand_id", "items", ["brand_id"])
    op.create_index("ix_items_storage_id", "items", ["storage_id"])
    op.create_index("ix_items_name", "items", ["name"])
    op.create_index("ix_items_last_used_date", "items", ["last_used_date"])

    op.create_table(
        "item_seasons",
        sa.Column(
            "item_id",
            sa.Integer(),
            sa.ForeignKey("items.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("season", sa.String(length=16), primary_key=True),
        sa.CheckConstraint(
            "season IN ('spring', 'summer', 'autumn', 'winter')",
            name="ck_item_seasons_season",
        ),
    )

    op.create_table(
        "item_images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "item_id",
            sa.Integer(),
            sa.ForeignKey("items.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.UniqueConstraint("item_id", "position", name="uq_item_images_item_position"),
    )
    op.create_index("ix_item_images_item_id", "item_images", ["item_id"])

    op.create_table(
        "item_pairings",
        sa.Column(
            "item_a_id",
            sa.Integer(),
            sa.ForeignKey("items.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "item_b_id",
            sa.Integer(),
            sa.ForeignKey("items.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.CheckConstraint("item_a_id < item_b_id", name="ck_item_pairings_ordered"),
    )
    op.create_index("ix_item_pairings_b", "item_pairings", ["item_b_id"])


def downgrade() -> None:
    op.drop_table("item_pairings")
    op.drop_table("item_images")
    op.drop_table("item_seasons")
    op.drop_table("items")
    op.drop_table("storages")
    op.drop_table("brands")
    op.drop_table("users")
