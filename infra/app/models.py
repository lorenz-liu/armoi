"""SQLAlchemy models.

Schema shape
------------
``brands`` and ``storages`` are thin, user-grown vocabularies (the "brand
library" and "storage library"); items reference them by FK so a rename
propagates everywhere.

``items`` holds the scalar fields. Multi-valued facets live in their own
tables so they stay queryable:

* ``item_seasons``  — one row per selected season.
* ``item_images``   — ordered, capped at ``MAX_IMAGES_PER_ITEM``.
* ``item_pairings`` — symmetric self-relation, stored once with
  ``item_a_id < item_b_id`` and read from either direction.

Categories are not a table: the tree is a fixed, generated vocabulary
(``categories_data``) and items store its dot-path id, which makes subtree
filtering a ``LIKE 'clothing.tops%'`` prefix match.
"""

from __future__ import annotations

from datetime import UTC, date, datetime

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config import (
    GENDERS,
    MAX_BRAND_LENGTH,
    MAX_NAME_LENGTH,
    MAX_NOTES_LENGTH,
    MAX_STORAGE_LENGTH,
    SEASONS,
)
from app.db import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        server_default=func.now(),
        nullable=False,
    )


class Brand(TimestampMixin, Base):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(MAX_BRAND_LENGTH), nullable=False)
    # Case-insensitive uniqueness: "Totême" and "totême" are one brand.
    normalized_name: Mapped[str] = mapped_column(String(MAX_BRAND_LENGTH), nullable=False)

    items: Mapped[list[Item]] = relationship(back_populates="brand")

    __table_args__ = (
        UniqueConstraint("normalized_name", name="uq_brands_normalized_name"),
        Index("ix_brands_normalized_name", "normalized_name"),
    )


class Storage(TimestampMixin, Base):
    __tablename__ = "storages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(MAX_STORAGE_LENGTH), nullable=False)
    normalized_name: Mapped[str] = mapped_column(String(MAX_STORAGE_LENGTH), nullable=False)

    items: Mapped[list[Item]] = relationship(back_populates="storage")

    __table_args__ = (
        UniqueConstraint("normalized_name", name="uq_storages_normalized_name"),
        Index("ix_storages_normalized_name", "normalized_name"),
    )


class Item(TimestampMixin, Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(MAX_NAME_LENGTH), nullable=False)

    brand_id: Mapped[int | None] = mapped_column(
        ForeignKey("brands.id", ondelete="SET NULL"), nullable=True
    )
    storage_id: Mapped[int | None] = mapped_column(
        ForeignKey("storages.id", ondelete="SET NULL"), nullable=True
    )

    category_id: Mapped[str | None] = mapped_column(String(160), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(16), nullable=True)

    price_amount: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    price_currency: Mapped[str | None] = mapped_column(String(3), nullable=True)

    notes: Mapped[str | None] = mapped_column(Text().with_variant(String(MAX_NOTES_LENGTH), "sqlite"))

    # A plain date, not a timestamp: "worn today" is a calendar fact, and the
    # client sends *its* today so the answer does not depend on server time.
    last_used_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    brand: Mapped[Brand | None] = relationship(back_populates="items", lazy="joined")
    storage: Mapped[Storage | None] = relationship(back_populates="items", lazy="joined")
    seasons: Mapped[list[ItemSeason]] = relationship(
        back_populates="item", cascade="all, delete-orphan", lazy="selectin"
    )
    images: Mapped[list[ItemImage]] = relationship(
        back_populates="item",
        cascade="all, delete-orphan",
        order_by="ItemImage.position",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint(
            "gender IS NULL OR gender IN " + str(GENDERS), name="ck_items_gender"
        ),
        CheckConstraint(
            "price_amount IS NULL OR price_amount >= 0", name="ck_items_price_non_negative"
        ),
        Index("ix_items_category_id", "category_id"),
        Index("ix_items_brand_id", "brand_id"),
        Index("ix_items_storage_id", "storage_id"),
        Index("ix_items_name", "name"),
        Index("ix_items_last_used_date", "last_used_date"),
    )

    @property
    def season_values(self) -> list[str]:
        order = {season: i for i, season in enumerate(SEASONS)}
        return sorted((s.season for s in self.seasons), key=lambda s: order.get(s, 99))


class ItemSeason(Base):
    __tablename__ = "item_seasons"

    item_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE"), primary_key=True
    )
    season: Mapped[str] = mapped_column(String(16), primary_key=True)

    item: Mapped[Item] = relationship(back_populates="seasons")

    __table_args__ = (
        CheckConstraint("season IN " + str(SEASONS), name="ck_item_seasons_season"),
    )


class ItemImage(TimestampMixin, Base):
    __tablename__ = "item_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    item_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE"), nullable=False
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)

    item: Mapped[Item] = relationship(back_populates="images")

    __table_args__ = (
        UniqueConstraint("item_id", "position", name="uq_item_images_item_position"),
        Index("ix_item_images_item_id", "item_id"),
    )


class ItemPairing(Base):
    """Symmetric "goes with" edge. Always stored with ``item_a_id < item_b_id``."""

    __tablename__ = "item_pairings"

    item_a_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE"), primary_key=True
    )
    item_b_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint("item_a_id < item_b_id", name="ck_item_pairings_ordered"),
        Index("ix_item_pairings_b", "item_b_id"),
    )
