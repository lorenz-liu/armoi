"""Pydantic request/response models (the wire contract)."""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.config import (
    CURRENCIES,
    GENDERS,
    MAX_BRAND_LENGTH,
    MAX_IMAGES_PER_ITEM,
    MAX_NAME_LENGTH,
    MAX_NOTES_LENGTH,
    MAX_STORAGE_LENGTH,
    SEASONS,
)

Season = Literal[SEASONS]  # type: ignore[valid-type]
Gender = Literal[GENDERS]  # type: ignore[valid-type]
Currency = Literal[CURRENCIES]  # type: ignore[valid-type]


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- vocabularies -----------------------------------------------------------
class VocabularyRead(ORMModel):
    id: int
    name: str
    item_count: int = 0
    created_at: datetime


class _NamedCreate(BaseModel):
    """Whitespace-only names are rejected rather than silently stored."""

    @field_validator("name", check_fields=False)
    @classmethod
    def _require_visible_name(cls, value: str) -> str:
        stripped = " ".join(value.split())
        if not stripped:
            raise ValueError("name cannot be blank")
        return stripped


class BrandCreate(_NamedCreate):
    name: Annotated[str, Field(min_length=1, max_length=MAX_BRAND_LENGTH)]


class StorageCreate(_NamedCreate):
    name: Annotated[str, Field(min_length=1, max_length=MAX_STORAGE_LENGTH)]


class VocabularyUpdate(_NamedCreate):
    name: Annotated[str, Field(min_length=1, max_length=MAX_STORAGE_LENGTH)]


# --- categories -------------------------------------------------------------
class CategoryNode(BaseModel):
    id: str
    zh: str
    en: str
    children: list[CategoryNode] = Field(default_factory=list)


# --- images -----------------------------------------------------------------
class ImageRead(ORMModel):
    id: int
    position: int
    url: str
    width: int | None = None
    height: int | None = None


class ImageReorder(BaseModel):
    image_ids: Annotated[list[int], Field(min_length=0, max_length=MAX_IMAGES_PER_ITEM)]


# --- items ------------------------------------------------------------------
class ItemSummary(ORMModel):
    """The shape a library grid cell needs — no pairings, no notes."""

    id: int
    name: str
    brand: str | None = None
    brand_id: int | None = None
    storage: str | None = None
    storage_id: int | None = None
    category_id: str | None = None
    gender: Gender | None = None
    seasons: list[Season] = Field(default_factory=list)
    price_amount: Decimal | None = None
    price_currency: Currency | None = None
    cover_image: ImageRead | None = None
    image_count: int = 0
    #: Set by the "used today" action, never by a plain update.
    last_used_date: date | None = None
    created_at: datetime
    updated_at: datetime


class ItemRead(ItemSummary):
    notes: str | None = None
    images: list[ImageRead] = Field(default_factory=list)
    pairings: list[ItemSummary] = Field(default_factory=list)


class ItemWrite(BaseModel):
    """Shared field set for create and update.

    Brand and storage are accepted as free text: an unknown value is added to
    the respective library, which is what makes autocomplete grow by itself.
    """

    name: Annotated[str, Field(min_length=1, max_length=MAX_NAME_LENGTH)]
    brand: Annotated[str | None, Field(max_length=MAX_BRAND_LENGTH)] = None
    storage: Annotated[str | None, Field(max_length=MAX_STORAGE_LENGTH)] = None
    category_id: str | None = None
    gender: Gender | None = None
    seasons: list[Season] = Field(default_factory=list)
    price_amount: Annotated[Decimal | None, Field(ge=0, max_digits=12, decimal_places=2)] = None
    price_currency: Currency | None = None
    notes: Annotated[str | None, Field(max_length=MAX_NOTES_LENGTH)] = None
    pairing_ids: list[int] = Field(default_factory=list)

    @field_validator("name")
    @classmethod
    def _require_visible_name(cls, value: str) -> str:
        stripped = " ".join(value.split())
        if not stripped:
            raise ValueError("name cannot be blank")
        return stripped

    @field_validator("brand", "storage", "notes", mode="before")
    @classmethod
    def _blank_to_none(cls, value: Any) -> Any:
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @field_validator("seasons", "pairing_ids")
    @classmethod
    def _dedupe(cls, value: list) -> list:
        seen: list = []
        for entry in value:
            if entry not in seen:
                seen.append(entry)
        return seen


class ItemCreate(ItemWrite):
    pass


class ItemUpdate(ItemWrite):
    """Full replacement of the writable field set (PUT semantics)."""


class PairingWrite(BaseModel):
    item_id: int


class UsageWrite(BaseModel):
    """Marks an item as worn.

    The client sends *its* calendar date, so "today" means the user's today
    rather than the server's.
    """

    used_on: date | None = None


# --- envelopes --------------------------------------------------------------
class Page[T](BaseModel):
    items: list[T]
    total: int
    limit: int
    offset: int


class LibraryStats(BaseModel):
    item_count: int
    brand_count: int
    storage_count: int
    image_count: int
    pairing_count: int


class Suggestion(BaseModel):
    id: int
    name: str
    item_count: int


CategoryNode.model_rebuild()
