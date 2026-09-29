"""Shared logic for the two user-grown vocabularies: brands and storages.

Both behave identically — created on demand when an item names one, matched
case-insensitively, offered back as prefix autocomplete — so they share one
generic implementation parameterised by the model class.
"""

from __future__ import annotations

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.config import AUTOCOMPLETE_LIMIT
from app.models import Brand, Item, Storage

#: Every generic below is parameterised over the two vocabulary tables.
type VocabularyModel = type[Brand | Storage]

#: Which Item column points back at each vocabulary table.
ITEM_FK_BY_MODEL = {Brand: Item.brand_id, Storage: Item.storage_id}


def normalize(name: str) -> str:
    """Fold a display name to its match key (trimmed, collapsed, lowercased)."""
    return " ".join(name.split()).casefold()


def clean(name: str) -> str:
    """Trim and collapse whitespace while preserving the user's casing."""
    return " ".join(name.split())


def find_by_name[V: (Brand, Storage)](session: Session, model: type[V], name: str) -> V | None:
    key = normalize(name)
    if not key:
        return None
    return session.scalar(select(model).where(model.normalized_name == key))


def get_or_create[V: (Brand, Storage)](
    session: Session, model: type[V], name: str | None
) -> V | None:
    """Resolve a free-text name to a row, creating it the first time it is used."""
    if name is None or not clean(name):
        return None
    existing = find_by_name(session, model, name)
    if existing is not None:
        return existing
    created = model(name=clean(name), normalized_name=normalize(name))
    session.add(created)
    session.flush()
    return created


def _count_subquery(model: VocabularyModel):
    fk = ITEM_FK_BY_MODEL[model]
    return (
        select(fk.label("ref_id"), func.count(Item.id).label("item_count"))
        .group_by(fk)
        .subquery()
    )


def list_with_counts[V: (Brand, Storage)](
    session: Session, model: type[V], search: str | None = None
) -> list[tuple[V, int]]:
    counts = _count_subquery(model)
    stmt: Select = (
        select(model, func.coalesce(counts.c.item_count, 0))
        .outerjoin(counts, counts.c.ref_id == model.id)
        .order_by(model.normalized_name)
    )
    if search and search.strip():
        stmt = stmt.where(model.normalized_name.contains(normalize(search)))
    return [(row[0], row[1]) for row in session.execute(stmt).all()]


def get_with_count[V: (Brand, Storage)](
    session: Session, model: type[V], pk: int
) -> tuple[V, int] | None:
    counts = _count_subquery(model)
    row = session.execute(
        select(model, func.coalesce(counts.c.item_count, 0))
        .outerjoin(counts, counts.c.ref_id == model.id)
        .where(model.id == pk)
    ).first()
    return (row[0], row[1]) if row else None


def suggest[V: (Brand, Storage)](
    session: Session, model: type[V], prefix: str, limit: int = AUTOCOMPLETE_LIMIT
) -> list[tuple[V, int]]:
    """Prefix autocomplete, most-used first so frequent choices surface early."""
    key = normalize(prefix)
    counts = _count_subquery(model)
    stmt = (
        select(model, func.coalesce(counts.c.item_count, 0).label("item_count"))
        .outerjoin(counts, counts.c.ref_id == model.id)
        .order_by(func.coalesce(counts.c.item_count, 0).desc(), model.normalized_name)
        .limit(limit)
    )
    if key:
        stmt = stmt.where(model.normalized_name.startswith(key))
    return [(row[0], row[1]) for row in session.execute(stmt).all()]


def rename[V: (Brand, Storage)](session: Session, instance: V, name: str) -> V:
    instance.name = clean(name)
    instance.normalized_name = normalize(name)
    session.flush()
    return instance
