"""/brands and /storages.

The two endpoints are behaviourally identical, so one router factory builds
both. Adding a third user-grown vocabulary later is a single call.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Response, status
from pydantic import BaseModel

from app.config import AUTOCOMPLETE_LIMIT
from app.deps import FiltersDep, SessionDep
from app.errors import CONFLICT, NOT_FOUND
from app.models import Brand, Storage
from app.schemas import (
    BrandCreate,
    ItemSummary,
    Page,
    StorageCreate,
    Suggestion,
    VocabularyRead,
    VocabularyUpdate,
)
from app.services import items as item_service
from app.services import vocabulary as vocab_service


def build_router(
    *,
    model: type[Brand | Storage],
    prefix: str,
    tag: str,
    create_schema: type[BaseModel],
    filter_field: str,
) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=[tag])
    noun = tag.rstrip("s").capitalize()

    def _read(instance, count: int) -> VocabularyRead:
        return VocabularyRead(
            id=instance.id, name=instance.name, item_count=count, created_at=instance.created_at
        )

    def _require(session, pk: int):
        found = vocab_service.get_with_count(session, model, pk)
        if found is None:
            raise HTTPException(NOT_FOUND, detail=f"{noun} {pk} not found.")
        return found

    @router.get("", response_model=list[VocabularyRead], summary=f"List every {noun.lower()}")
    def list_all(session: SessionDep, search: str | None = None) -> list[VocabularyRead]:
        return [_read(row, count) for row, count in vocab_service.list_with_counts(session, model, search)]

    @router.get("/suggest", response_model=list[Suggestion], summary="Prefix autocomplete")
    def suggest(
        session: SessionDep,
        q: Annotated[str, Query(description="Name prefix")] = "",
        limit: Annotated[int, Query(ge=1, le=50)] = AUTOCOMPLETE_LIMIT,
    ) -> list[Suggestion]:
        return [
            Suggestion(id=row.id, name=row.name, item_count=count)
            for row, count in vocab_service.suggest(session, model, q, limit)
        ]

    def create(payload, session: SessionDep) -> VocabularyRead:
        instance = vocab_service.get_or_create(session, model, payload.name)
        return _read(instance, 0)

    # The payload type varies per vocabulary, and `from __future__ import
    # annotations` turns annotations into strings FastAPI cannot resolve for a
    # local name — so bind the real class before registering the route.
    create.__annotations__["payload"] = create_schema
    router.post("", response_model=VocabularyRead, status_code=status.HTTP_201_CREATED)(create)

    @router.get("/{pk}", response_model=VocabularyRead)
    def read(pk: int, session: SessionDep) -> VocabularyRead:
        instance, count = _require(session, pk)
        return _read(instance, count)

    @router.put("/{pk}", response_model=VocabularyRead)
    def rename(pk: int, payload: VocabularyUpdate, session: SessionDep) -> VocabularyRead:
        instance, count = _require(session, pk)
        clash = vocab_service.find_by_name(session, model, payload.name)
        if clash is not None and clash.id != pk:
            raise HTTPException(CONFLICT, detail=f"{noun} '{payload.name}' already exists.")
        vocab_service.rename(session, instance, payload.name)
        return _read(instance, count)

    @router.delete("/{pk}", status_code=status.HTTP_204_NO_CONTENT)
    def delete(pk: int, session: SessionDep) -> Response:
        instance, _ = _require(session, pk)
        # Items survive; their reference is cleared by ON DELETE SET NULL.
        session.delete(instance)
        session.flush()
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @router.get(
        "/{pk}/items",
        response_model=Page[ItemSummary],
        summary=f"Everything filed under one {noun.lower()}",
    )
    def list_items(pk: int, session: SessionDep, filters: FiltersDep) -> Page[ItemSummary]:
        _require(session, pk)
        setattr(filters, filter_field, [pk])
        rows, total = item_service.list_items(session, filters)
        return Page[ItemSummary](
            items=[item_service.serialize_summary(row) for row in rows],
            total=total,
            limit=filters.limit,
            offset=filters.offset,
        )

    return router


brands_router = build_router(
    model=Brand,
    prefix="/brands",
    tag="brands",
    create_schema=BrandCreate,
    filter_field="brand_ids",
)

storages_router = build_router(
    model=Storage,
    prefix="/storages",
    tag="storages",
    create_schema=StorageCreate,
    filter_field="storage_ids",
)
