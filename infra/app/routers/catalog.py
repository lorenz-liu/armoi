"""/categories, /meta, /stats — the read-only vocabularies the UI builds on."""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import func, select

from app.categories_data import CATEGORY_LIST, CATEGORY_TREE
from app.config import CURRENCIES, DEFAULT_CURRENCY, GENDERS, MAX_IMAGES_PER_ITEM, SEASONS
from app.deps import CurrentUser, SessionDep
from app.models import Brand, Item, ItemImage, ItemPairing, Storage
from app.schemas import CategoryNode, LibraryStats

router = APIRouter(tags=["catalog"])


class FlatCategory(BaseModel):
    id: str
    zh: str
    en: str
    depth: int
    parent_id: str | None
    is_leaf: bool


class Meta(BaseModel):
    seasons: list[str]
    genders: list[str]
    currencies: list[str]
    default_currency: str
    max_images_per_item: int


@router.get("/categories", response_model=list[CategoryNode], summary="Category tree")
def categories() -> list[CategoryNode]:
    return [CategoryNode.model_validate(node) for node in CATEGORY_TREE]


@router.get("/categories/flat", response_model=list[FlatCategory], summary="Flattened tree")
def categories_flat() -> list[FlatCategory]:
    return [FlatCategory.model_validate(node) for node in CATEGORY_LIST]


@router.get("/meta", response_model=Meta, summary="Enumerations the forms need")
def meta() -> Meta:
    return Meta(
        seasons=list(SEASONS),
        genders=list(GENDERS),
        currencies=list(CURRENCIES),
        default_currency=DEFAULT_CURRENCY,
        max_images_per_item=MAX_IMAGES_PER_ITEM,
    )


@router.get("/stats", response_model=LibraryStats, summary="Library counters")
def stats(session: SessionDep, user: CurrentUser) -> LibraryStats:
    item_ids = select(Item.id).where(Item.user_id == user.id)
    return LibraryStats(
        item_count=session.scalar(
            select(func.count()).select_from(Item).where(Item.user_id == user.id)
        )
        or 0,
        brand_count=session.scalar(
            select(func.count()).select_from(Brand).where(Brand.user_id == user.id)
        )
        or 0,
        storage_count=session.scalar(
            select(func.count()).select_from(Storage).where(Storage.user_id == user.id)
        )
        or 0,
        image_count=session.scalar(
            select(func.count()).select_from(ItemImage).where(ItemImage.item_id.in_(item_ids))
        )
        or 0,
        pairing_count=session.scalar(
            select(func.count())
            .select_from(ItemPairing)
            .where(ItemPairing.item_a_id.in_(item_ids))
        )
        or 0,
    )
