"""Item queries, mutations and serialization.

Everything the library screens need — search, filters, sorting, paging — is
expressed once here so the main, brand and storage screens share it. Every
query is scoped to the owning user.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from dataclasses import dataclass, field
from datetime import UTC, date, datetime

from fastapi import HTTPException
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.categories_data import CATEGORY_BY_ID, CATEGORY_IDS
from app.config import (
    CATEGORY_PATH_SEPARATOR,
    DEFAULT_ORDER,
    DEFAULT_PAGE_SIZE,
    DEFAULT_SORT,
    SEASONS,
)
from app.errors import NOT_FOUND, UNPROCESSABLE
from app.models import Brand, Item, ItemImage, ItemPairing, ItemSeason, Storage
from app.schemas import ImageRead, ItemRead, ItemSummary, ItemWrite
from app.services import images as image_service
from app.services import vocabulary

#: Sort name -> column. The names themselves are configuration; this is the
#: one place the ORM is in scope to bind them.
#:
#: `last_used` relies on SQLite's NULL ordering, which happens to be exactly
#: right here: ascending puts never-worn pieces first ("longest unused"), and
#: descending puts them last ("recently worn"). `test_sorting` pins that down.
SORT_COLUMNS = {
    "created_at": Item.created_at,
    "updated_at": Item.updated_at,
    "name": Item.name,
    "price": Item.price_amount,
    "last_used": Item.last_used_date,
}


@dataclass(slots=True)
class ItemFilters:
    """Every way the library can be narrowed. All fields AND together."""

    search: str | None = None
    brand_ids: list[int] = field(default_factory=list)
    storage_ids: list[int] = field(default_factory=list)
    category_ids: list[str] = field(default_factory=list)
    genders: list[str] = field(default_factory=list)
    seasons: list[str] = field(default_factory=list)
    currency: str | None = None
    min_price: float | None = None
    max_price: float | None = None
    sort: str = DEFAULT_SORT
    order: str = DEFAULT_ORDER
    limit: int = DEFAULT_PAGE_SIZE
    offset: int = 0


# --- lookups ----------------------------------------------------------------
def get_item(session: Session, item_id: int, *, user_id: int) -> Item:
    item = session.scalar(
        select(Item).where(Item.id == item_id, Item.user_id == user_id)
    )
    if item is None:
        raise HTTPException(NOT_FOUND, detail=f"Item {item_id} not found.")
    return item


def validate_category(category_id: str | None) -> str | None:
    if category_id is None or not category_id.strip():
        return None
    if category_id not in CATEGORY_IDS:
        raise HTTPException(UNPROCESSABLE, detail=f"Unknown category: {category_id}")
    return category_id


# --- querying ---------------------------------------------------------------
def _search_clause(term: str):
    """Match any textual facet of an item: name, notes, brand, storage, category."""
    pattern = f"%{term.strip().casefold()}%"
    category_matches = [
        cid
        for cid, node in CATEGORY_BY_ID.items()
        if term.strip().casefold() in node["en"].casefold() or term.strip() in node["zh"]
    ]
    clauses = [
        Item.name.icontains(pattern.strip("%")),
        Item.notes.icontains(pattern.strip("%")),
        Item.brand.has(Brand.normalized_name.contains(term.strip().casefold())),
        Item.storage.has(Storage.normalized_name.contains(term.strip().casefold())),
    ]
    if category_matches:
        # A hit on a branch label should also return everything beneath it.
        clauses.extend(
            Item.category_id.startswith(cid) for cid in category_matches
        )
    return or_(*clauses)


def build_query(filters: ItemFilters, *, user_id: int) -> Select:
    stmt = select(Item).where(Item.user_id == user_id)

    if filters.search and filters.search.strip():
        stmt = stmt.where(_search_clause(filters.search))
    if filters.brand_ids:
        stmt = stmt.where(Item.brand_id.in_(filters.brand_ids))
    if filters.storage_ids:
        stmt = stmt.where(Item.storage_id.in_(filters.storage_ids))
    if filters.category_ids:
        # Prefix match so picking a branch includes its whole subtree.
        stmt = stmt.where(
            or_(
                *[
                    or_(
                        Item.category_id == cid,
                        Item.category_id.startswith(cid + CATEGORY_PATH_SEPARATOR),
                    )
                    for cid in filters.category_ids
                ]
            )
        )
    if filters.genders:
        stmt = stmt.where(Item.gender.in_(filters.genders))
    if filters.seasons:
        stmt = stmt.where(
            Item.id.in_(select(ItemSeason.item_id).where(ItemSeason.season.in_(filters.seasons)))
        )
    if filters.currency:
        stmt = stmt.where(Item.price_currency == filters.currency)
    if filters.min_price is not None:
        stmt = stmt.where(Item.price_amount >= filters.min_price)
    if filters.max_price is not None:
        stmt = stmt.where(Item.price_amount <= filters.max_price)

    column = SORT_COLUMNS.get(filters.sort, SORT_COLUMNS[DEFAULT_SORT])
    direction = column.desc() if filters.order == "desc" else column.asc()
    # id is the tiebreaker so paging stays stable when sort keys collide.
    return stmt.order_by(direction, Item.id.desc())


def count_items(session: Session, filters: ItemFilters, *, user_id: int) -> int:
    subquery = build_query(filters, user_id=user_id).order_by(None).subquery()
    return session.scalar(select(func.count()).select_from(subquery)) or 0


def list_items(
    session: Session, filters: ItemFilters, *, user_id: int
) -> tuple[list[Item], int]:
    total = count_items(session, filters, user_id=user_id)
    stmt = build_query(filters, user_id=user_id).limit(filters.limit).offset(filters.offset)
    return list(session.scalars(stmt).unique().all()), total


# --- pairings ---------------------------------------------------------------
def _ordered(a: int, b: int) -> tuple[int, int]:
    return (a, b) if a < b else (b, a)


def pairing_ids_for(session: Session, item_id: int) -> list[int]:
    rows = session.execute(
        select(ItemPairing.item_a_id, ItemPairing.item_b_id).where(
            or_(ItemPairing.item_a_id == item_id, ItemPairing.item_b_id == item_id)
        )
    ).all()
    return [b if a == item_id else a for a, b in rows]


def paired_items(session: Session, item_id: int, *, user_id: int) -> list[Item]:
    ids = pairing_ids_for(session, item_id)
    if not ids:
        return []
    stmt = (
        select(Item)
        .where(Item.id.in_(ids), Item.user_id == user_id)
        .order_by(Item.name)
    )
    return list(session.scalars(stmt).unique().all())


def set_pairings(
    session: Session, item: Item, partner_ids: Iterable[int], *, user_id: int
) -> None:
    """Replace the item's pairing set. Edges are symmetric by construction."""
    wanted = {pid for pid in partner_ids if pid != item.id}
    if wanted:
        found = set(
            session.scalars(
                select(Item.id).where(Item.id.in_(wanted), Item.user_id == user_id)
            ).all()
        )
        missing = wanted - found
        if missing:
            raise HTTPException(
                UNPROCESSABLE, detail=f"Cannot pair with unknown item(s): {sorted(missing)}"
            )

    current = set(pairing_ids_for(session, item.id))
    for partner_id in current - wanted:
        a, b = _ordered(item.id, partner_id)
        session.query(ItemPairing).filter_by(item_a_id=a, item_b_id=b).delete()
    for partner_id in wanted - current:
        a, b = _ordered(item.id, partner_id)
        session.add(ItemPairing(item_a_id=a, item_b_id=b))
    session.flush()


def add_pairing(session: Session, item: Item, partner_id: int, *, user_id: int) -> None:
    set_pairings(
        session,
        item,
        set(pairing_ids_for(session, item.id)) | {partner_id},
        user_id=user_id,
    )


def remove_pairing(session: Session, item: Item, partner_id: int, *, user_id: int) -> None:
    set_pairings(
        session,
        item,
        set(pairing_ids_for(session, item.id)) - {partner_id},
        user_id=user_id,
    )


# --- mutations --------------------------------------------------------------
def _apply_seasons(session: Session, item: Item, seasons: Sequence[str]) -> None:
    order = {s: i for i, s in enumerate(SEASONS)}
    wanted = sorted({s for s in seasons}, key=lambda s: order.get(s, 99))
    item.seasons = [ItemSeason(item_id=item.id, season=season) for season in wanted]
    session.flush()


def _apply_scalars(
    session: Session, item: Item, payload: ItemWrite, *, user_id: int
) -> None:
    item.name = payload.name.strip()
    item.brand = vocabulary.get_or_create(session, Brand, payload.brand, user_id=user_id)
    item.storage = vocabulary.get_or_create(
        session, Storage, payload.storage, user_id=user_id
    )
    item.category_id = validate_category(payload.category_id)
    item.gender = payload.gender
    item.price_amount = payload.price_amount
    # A bare amount is meaningless without a unit, and vice versa.
    item.price_currency = payload.price_currency if payload.price_amount is not None else None
    item.notes = payload.notes


def create_item(session: Session, payload: ItemWrite, *, user_id: int) -> Item:
    item = Item(name=payload.name.strip(), user_id=user_id)
    session.add(item)
    _apply_scalars(session, item, payload, user_id=user_id)
    session.flush()
    _apply_seasons(session, item, payload.seasons)
    set_pairings(session, item, payload.pairing_ids, user_id=user_id)
    session.refresh(item)
    return item


def update_item(
    session: Session, item: Item, payload: ItemWrite, *, user_id: int
) -> Item:
    _apply_scalars(session, item, payload, user_id=user_id)
    _apply_seasons(session, item, payload.seasons)
    set_pairings(session, item, payload.pairing_ids, user_id=user_id)
    session.flush()
    session.refresh(item)
    return item


def mark_used(session: Session, item: Item, used_on: date | None = None) -> Item:
    """Record that the piece was worn.

    Falls back to the server's UTC date; clients send their own local date so
    a timezone gap cannot record yesterday.
    """
    item.last_used_date = used_on or datetime.now(UTC).date()
    session.flush()
    session.refresh(item)
    return item


def clear_used(session: Session, item: Item) -> Item:
    item.last_used_date = None
    session.flush()
    session.refresh(item)
    return item


def delete_item(session: Session, item: Item) -> None:
    image_service.delete_images_for_item(session, item)
    session.delete(item)
    session.flush()


# --- serialization ----------------------------------------------------------
def serialize_image(image: ItemImage) -> ImageRead:
    return ImageRead(
        id=image.id,
        position=image.position,
        url=image_service.image_url(image.filename),
        width=image.width,
        height=image.height,
    )


def serialize_summary(item: Item) -> ItemSummary:
    return ItemSummary(
        id=item.id,
        name=item.name,
        brand=item.brand.name if item.brand else None,
        brand_id=item.brand_id,
        storage=item.storage.name if item.storage else None,
        storage_id=item.storage_id,
        category_id=item.category_id,
        gender=item.gender,
        seasons=item.season_values,
        price_amount=item.price_amount,
        price_currency=item.price_currency,
        cover_image=serialize_image(item.images[0]) if item.images else None,
        image_count=len(item.images),
        last_used_date=item.last_used_date,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


def serialize_detail(session: Session, item: Item) -> ItemRead:
    summary = serialize_summary(item)
    return ItemRead(
        **summary.model_dump(),
        notes=item.notes,
        images=[serialize_image(image) for image in item.images],
        pairings=[
            serialize_summary(partner)
            for partner in paired_items(session, item.id, user_id=item.user_id)
        ],
    )
